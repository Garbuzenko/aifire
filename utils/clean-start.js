const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3011;
const LOCK_FILE = path.join(process.cwd(), '.next', 'dev', 'lock');

// Fix PATH for Windows if standard paths are missing
if (process.platform === 'win32') {
  const standardPaths = [
    'C:\\Windows\\System32',
    'C:\\Windows',
    'C:\\Windows\\System32\\Wbem',
    'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\'
  ];
  
  const currentPath = process.env.PATH || '';
  const missingPaths = standardPaths.filter(p => !currentPath.includes(p));
  
  if (missingPaths.length > 0) {
    process.env.PATH = missingPaths.join(';') + ';' + currentPath;
    console.log('[clean-start] Fixed PATH environment variable.');
  }
}

function log(msg) {
  console.log(`[clean-start] ${msg}`);
}

function getPidsForPort(port) {
  const pids = new Set();
  
  if (process.platform === 'win32') {
    // Try netstat first now that PATH is fixed
    try {
      const output = execSync('netstat -ano', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const lines = output.split('\n');
      lines.forEach(line => {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          // Check if local address ends with :port
          if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
            const pid = parts[parts.length - 1];
            if (pid && /^\d+$/.test(pid) && pid !== '0') {
              pids.add(pid);
            }
          }
        }
      });
    } catch (e) {
      // netstat failed
    }

    // Fallback to PowerShell if netstat didn't work
    if (pids.size === 0) {
      try {
        const cmd = `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`;
        const output = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        if (output) {
          output.split(/\s+/).forEach(pid => {
            if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
          });
        }
      } catch (e) {
        // PowerShell failed
      }
    }
  } else {
    // Linux/Mac
    try {
      const output = execSync(`lsof -t -i:${port}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (output) {
        output.split('\n').forEach(pid => pids.add(pid));
      }
    } catch (e) {
      // lsof failed
    }
  }
  
  return Array.from(pids);
}

function killPid(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGKILL');
    }
    log(`Killed PID ${pid}`);
  } catch (e) {
    // Ignore if already dead
  }
}

async function waitForPortRelease(port, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const pids = getPidsForPort(port);
    if (pids.length === 0) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return false;
}

async function main() {
  log(`Checking port ${PORT}...`);
  
  let pids = getPidsForPort(PORT);
  if (pids.length > 0) {
    log(`Found processes on port ${PORT}: ${pids.join(', ')}`);
    pids.forEach(killPid);
    
    log('Waiting for port to be released...');
    const released = await waitForPortRelease(PORT);
    if (!released) {
      log('WARNING: Port might still be in use. Trying to proceed anyway...');
      // Try one last kill attempt
      getPidsForPort(PORT).forEach(killPid);
    } else {
      log('Port released.');
    }
  } else {
    log('Port is free.');
  }

  if (fs.existsSync(LOCK_FILE)) {
    try {
      fs.unlinkSync(LOCK_FILE);
      log('Removed .next/dev/lock file.');
    } catch (e) {
      log(`Failed to remove lock file: ${e.message}`);
    }
  }

  log('Starting Next.js...');
  
  // Use shell: true for better compatibility
  // Use npx directly
  const nextDev = spawn('npx', ['next', 'dev', '--webpack', '-p', String(PORT)], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  nextDev.on('close', (code) => {
    process.exit(code);
  });
}

main();
