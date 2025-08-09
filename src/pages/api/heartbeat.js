import { createClient } from '@supabase/supabase-js';
import transporter from '@/components/config/nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    await sendAlertEmail('Missing Supabase credentials', {
      supabaseUrlPresent: !!supabaseUrl,
      supabaseKeyPresent: !!supabaseKey,
    });
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  try {
    const startedAt = Date.now();
    const insertPromise = supabase
      .from('heartbeat')
      .insert([{ source: 'vercel-cron', note: `Triggered at ${new Date().toISOString()}` }], { returning: 'minimal' });

    const { error } = await Promise.race([
      insertPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 8000ms')), 8000)),
    ]);

    const elapsedMs = Date.now() - startedAt;

    if (error) {
      await sendAlertEmail('Supabase heartbeat failed', { error: error.message, elapsedMs });
      return res.status(500).json({ status: 'error', details: error.message, elapsedMs });
    }

    return res.status(200).json({ status: 'ok', elapsedMs });
  } catch (err) {
    const reason = err?.message || 'unknown error';
    await sendAlertEmail('Supabase heartbeat exception', { reason });
    const isTimeout = /Timeout/i.test(reason);
    return res.status(isTimeout ? 504 : 500).json({ status: isTimeout ? 'timeout' : 'exception', reason });
  } finally {
    // no-op
  }
}

async function sendAlertEmail(subject, details) {
  try {
    await transporter.sendMail({
      from: `15-viki-bg Database Heartbeat Monitor <${process.env.NEXT_PUBLIC_EMAIL}>`,
      to: 'hm.websiteprovisioning@gmail.com',
      subject: `15-viki-bg Database Heartbeat [ALERT] ${subject}`,
      text: JSON.stringify({ time: new Date().toISOString(), ...details }, null, 2) + '\n\n' + 'https://supabase.com/dashboard/project/nticlbmuetfeuwkkukwz',
    });
  } catch (e) {
    // Swallow errors to avoid cascading failures
  }
}

