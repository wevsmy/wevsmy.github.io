async function notice(tp) {
    const text = await tp.system.prompt("What's Good?")
    new Notice(text, 5000)
}

module.exports = notice