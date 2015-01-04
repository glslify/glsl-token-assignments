const chalk = require('chalk')

module.exports = (tokens, property1, property2) => {
  if (process.browser) return
  property1 = property1 || 'declaration'
  property2 = property2 || 'assignment'
  chalk.enabled = true

  console.error()
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.type === 'eof') continue
    if (token[property1]) {
      process.stderr.write(chalk.green(token.data))
    } else
    if (token[property2]) {
      process.stderr.write(chalk.yellow(token.data))
    } else {
      process.stderr.write(token.data)
    }
  }
  console.error()
  console.error()
}
