// just remove the prefix
module.exports = {
  input: class extends require('inquirer/lib/prompts/input') {
    getQuestion() {
      const message = super.getQuestion()
      return message.slice(12)
    }
  },
  list: class extends require('inquirer/lib/prompts/list') {
    getQuestion() {
      const message = super.getQuestion()
      return message.slice(12)
    }
  }
}
