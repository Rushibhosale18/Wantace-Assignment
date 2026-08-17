const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { calculateEstimate } = require('./services/calculator');
const { requireOwnerAuth } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// PUBLIC ENDPOINTS

// GET /api/config - Public config endpoint
app.get('/api/config', async (req, res) => {
  try {
    const config = await prisma.config.findFirst({
      include: {
        questions: {
          where: { active: true },
          orderBy: { order: 'asc' },
          include: {
            options: { orderBy: { order: 'asc' } }
          }
        }
      }
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    // Omit sensitive modifiers from public response
    const { waste_factor, permit_flat_fee, range_spread_pct, ...publicConfig } = config;
    
    res.json(publicConfig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching config' });
  }
});

// POST /api/estimate - Submit answers and get estimate
app.post('/api/estimate', async (req, res) => {
  try {
    const { name, phone, email, answers } = req.body;

    if (!name || !phone || !email || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch active config for calculation
    const config = await prisma.config.findFirst({
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    if (!config) {
      return res.status(500).json({ error: 'System configuration error' });
    }

    // Server-Side Calculation
    const { estimate_low, estimate_high } = calculateEstimate(config, answers);

    // Save Lead
    const lead = await prisma.lead.create({
      data: {
        config_version: config.config_version,
        name,
        phone,
        email,
        answers: JSON.stringify(answers),
        estimate_low,
        estimate_high
      }
    });

    res.json({
      estimate_low,
      estimate_high,
      lead_id: lead.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error processing estimate' });
  }
});


// ADMIN ENDPOINTS

// POST /api/auth/login - Simple login check
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'roofing2026!';

  if (username === adminUser && password === adminPass) {
    res.json({ success: true, message: 'Valid credentials' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// GET /api/admin/leads - Fetch all leads
app.get('/api/admin/leads', requireOwnerAuth, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { captured_at: 'desc' }
    });
    // Parse JSON string answers back to object for admin UI
    const mappedLeads = leads.map(l => ({
      ...l,
      answers: JSON.parse(l.answers)
    }));
    res.json(mappedLeads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching leads' });
  }
});

// GET /api/admin/config - Fetch FULL config for admin editor
app.get('/api/admin/config', requireOwnerAuth, async (req, res) => {
  try {
    const config = await prisma.config.findFirst({
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: { orderBy: { order: 'asc' } }
          }
        }
      }
    });
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching full config' });
  }
});

// PUT /api/admin/config - Update config and increment version
app.put('/api/admin/config', requireOwnerAuth, async (req, res) => {
  try {
    const data = req.body;
    
    // We expect the full config object to be sent back.
    // For a real production app, we might do granular updates, but for this 24hr challenge, 
    // replacing the config questions/options is easiest.
    
    // Execute a transaction to ensure integrity
    await prisma.$transaction(async (tx) => {
      const currentConfig = await tx.config.findFirst();
      
      // Update config modifiers and version
      await tx.config.update({
        where: { id: currentConfig.id },
        data: {
          config_version: currentConfig.config_version + 1,
          business_name: data.business_name,
          business_region: data.business_region,
          business_currency: data.business_currency,
          waste_factor: data.waste_factor,
          permit_flat_fee: data.permit_flat_fee,
          range_spread_pct: data.range_spread_pct
        }
      });
      
      // Since it's a small dataset, the easiest way to handle deeply nested updates 
      // without complex diffing is to delete and recreate questions & options
      await tx.option.deleteMany();
      await tx.question.deleteMany();
      
      for (const q of data.questions) {
        await tx.question.create({
          data: {
            configId: currentConfig.id,
            key: q.key,
            label: q.label,
            type: q.type,
            unit: q.unit || null,
            required: q.required,
            min: q.min || null,
            max: q.max || null,
            active: q.active,
            order: q.order,
            options: {
              create: q.options ? q.options.map(opt => ({
                value: opt.value,
                label: opt.label,
                rate_per_sqft: opt.rate_per_sqft || null,
                multiplier: opt.multiplier || null,
                tear_off_per_sqft: opt.tear_off_per_sqft || null,
                order: opt.order
              })) : []
            }
          }
        });
      }
    });
    
    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating config' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
