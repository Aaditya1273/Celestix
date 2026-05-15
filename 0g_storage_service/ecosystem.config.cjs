/**
 * PM2 Ecosystem Config — Beyond-The-Fog Unified Core
 *
 * Usage:
 *   npm install -g pm2
 *   pm2 start ecosystem.config.cjs
 *   pm2 save          # persist across reboots
 *   pm2 startup       # auto-start on system boot
 *   pm2 logs          # tail logs
 *   pm2 monit         # live dashboard
 */
module.exports = {
    apps: [
        {
            name:         'beyond-the-fog-core',
            script:       'index.js',
            interpreter:  'node',
            // ESM support
            node_args:    '--experimental-vm-modules',
            instances:    1,
            autorestart:  true,
            watch:        false,
            max_memory_restart: '512M',
            restart_delay: 3000,   // wait 3s before restarting on crash
            max_restarts:  10,     // give up after 10 rapid crashes
            env: {
                NODE_ENV: 'production',
                PORT:     3002,
            },
            // Structured log output
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file:  './logs/error.log',
            out_file:    './logs/out.log',
            merge_logs:  true,
        },
    ],
};
