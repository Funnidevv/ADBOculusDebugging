// server.js
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Helper to run ADB command and return output
function runAdbCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(`adb ${cmd}`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// List connected devices
app.get('/api/devices', async (req, res) => {
  try {
    const output = await runAdbCommand('devices');
    res.json({ success: true, output });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

// Run arbitrary ADB shell command (dangerous - in production add auth!)
app.post('/api/shell', async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ success: false, error: 'No command provided' });

  try {
    const output = await runAdbCommand(`shell ${command}`);
    res.json({ success: true, output });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

// Reboot device
app.post('/api/reboot', async (req, res) => {
  try {
    const output = await runAdbCommand('reboot');
    res.json({ success: true, output });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

// Install APK (assumes APK path is on server machine)
app.post('/api/install', async (req, res) => {
  const { apkPath } = req.body;
  if (!apkPath) return res.status(400).json({ success: false, error: 'No apkPath provided' });

  try {
    const output = await runAdbCommand(`install "${apkPath}"`);
    res.json({ success: true, output });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

// Pull file
app.post('/api/pull', async (req, res) => {
  const { devicePath, localPath } = req.body;
  if (!devicePath || !localPath) return res.status(400).json({ success: false, error: 'Missing paths' });

  try {
    const output = await runAdbCommand(`pull "${devicePath}" "${localPath}"`);
    res.json({ success: true, output });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

// Push file
app.post('/api/push', async (req, res) => {
  const { localPath, devicePath } = req.body;
  if (!localPath || !devicePath) return res.status(400).json({ success: false, error: 'Missing paths' });

  try {
    const output = await runAdbCommand(`push "${localPath}" "${devicePath}"`);
    res.json({ success: true, output });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

// Generic run command
app.post('/api/run', async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ success: false, error: 'No command provided' });

  try {
    const output = await runAdbCommand(command);
    res.json({ success: true, output });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

app.listen(port, () => {
  console.log(`ADB API server running at http://localhost:${port}`);
});
