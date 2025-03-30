
from flask import Flask, request, jsonify, send_from_directory
from flask_mail import Mail, Message
import json
import os

app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/')
def root():
    return send_from_directory('.', 'index.html')

@app.route('/attached_assets/<path:filename>')
def serve_attachments(filename):
    return send_from_directory('attached_assets', filename)

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'info.royalrottweiler@gmail.com'
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASSWORD', 'test_password')

mail = Mail(app)

# Store feedback in a JSON file
FEEDBACK_FILE = 'feedback.json'

def load_feedback():
    try:
        with open(FEEDBACK_FILE, 'r') as f:
            return json.load(f)
    except:
        return {'pending': [], 'approved': []}

def save_feedback(data):
    with open(FEEDBACK_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    if not app.config['MAIL_PASSWORD']:
        return jsonify({'status': 'error', 'message': 'Email configuration is not set up properly'})
        
    data = request.json
    
    # Send email to admin
    admin_msg = Message(
        'New Contact Form Submission',
        sender='info.royalrottweiler@gmail.com',
        recipients=['info.royalrottweiler@gmail.com']
    )
    admin_msg.body = f"""
    Name: {data['name']}
    Email: {data['email']}
    Phone: {data['phone']}
    Message: {data['message']}
    """
    
    # Send confirmation to user
    user_msg = Message(
        'Thank you for contacting Royal Rottweiler Champions',
        sender='info.royalrottweiler@gmail.com',
        recipients=[data['email']]
    )
    user_msg.body = """
    Thank you for contacting Royal Rottweiler Champions!
    We have received your message and will get back to you shortly.
    
    Best regards,
    Royal Rottweiler Champions Team
    """
    
    try:
        mail.send(admin_msg)
        mail.send(user_msg)
        return jsonify({'status': 'success', 'message': 'Message sent successfully!'})
    except Exception as e:
        print(f"Email error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Unable to send email. Please try again later.'})

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    feedback_data = load_feedback()
    feedback_data['pending'].append(data)
    save_feedback(feedback_data)
    return jsonify({'status': 'success'})

@app.route('/api/feedback/approve', methods=['POST'])
def approve_feedback():
    data = request.json
    feedback_data = load_feedback()
    
    # Find and move feedback from pending to approved
    for i, item in enumerate(feedback_data['pending']):
        if item['id'] == data['id']:
            feedback_data['approved'].append(item)
            feedback_data['pending'].pop(i)
            break
    
    save_feedback(feedback_data)
    return jsonify({'status': 'success'})

@app.route('/api/feedback/approved', methods=['GET'])
def get_approved_feedback():
    feedback_data = load_feedback()
    return jsonify(feedback_data['approved'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
