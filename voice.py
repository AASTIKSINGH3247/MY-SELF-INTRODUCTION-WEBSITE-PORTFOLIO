@app.route('/voice-recorder')
def voice_recorder():
    return render_template('voice_recorder.html')

@app.route('/generate-voice')
def generate_voice():
    return render_template('generate_voice.html')

@app.route('/mixing-console')
def mixing_console():
    return render_template('mixing_console.html')
