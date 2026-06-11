const n = (process.argv.indexOf('-i') !== -1) ? Number(process.argv[process.argv.indexOf('-i')+1]) : -1;
// const expose = (process.argv.indexOf('--expose-gc') !== -1) ? '--expose-gc' : '';
const expose = '--expose-gc';

module.exports = {
  apps : [{
    name: 'siap-server',
    script: 'out/init.js',

    node_args: `${expose}`,
    instances: n,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    env_test: {
      NODE_ENV: 'test'
    }
  }],
};
