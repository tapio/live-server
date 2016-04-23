var child_process = require('child_process');
var options = {stdio: 'inherit'};
try {
  child_process.execSync('jslint *.js', options);
} catch(err) {
  console.log(err.message);
}
try {
  child_process.execSync('eslint .', options);
} catch(err) {
  console.log(err.message);
}
