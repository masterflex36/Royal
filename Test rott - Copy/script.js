
function showAKCForm(puppyName) {
    document.getElementById('akcForm').style.display = 'flex';
    document.getElementById('selectedPuppy').value = `Selected Puppy: ${puppyName}`;
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
}

function contact(puppyName) {
    showAKCForm(puppyName);
}

async function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const phoneInput = form.querySelector('input[type="tel"]');
    const phone = window.intlTelInputGlobals.getInstance(phoneInput).getNumber();
    const message = form.querySelector('textarea').value;

    if (!name || !email || !phone || !message) {
        alert('Please fill in all fields');
        return;
    }

    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    if (!window.intlTelInputGlobals.getInstance(phoneInput).isValidNumber()) {
        alert('Please enter a valid phone number');
        return;
    }

    const formData = { name, email, phone, message };

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Thank you for your inquiry! We will contact you soon.');
            event.target.reset();
        } else {
            alert('There was an error sending your message. Please try again.');
        }
    } catch (error) {
        alert('There was an error sending your message. Please try again.');
    }
}

document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        section.scrollIntoView({ behavior: 'smooth' });
    });
});

function toggleMenu() {
    const menu = document.querySelector('nav ul');
    menu.classList.toggle('show');
}

// Initialize phone inputs
window.addEventListener('DOMContentLoaded', (event) => {
    const phoneInputs = document.querySelectorAll('.phone-input');
    phoneInputs.forEach(input => {
        intlTelInput(input, {
            initialCountry: "us",
            preferredCountries: ["us"],
            separateDialCode: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js"
        });
    });
});

async function addComment(event) {
    event.preventDefault();
    const name = document.getElementById('comment-name').value;
    const text = document.getElementById('comment-text').value;
    
    const feedback = {
        id: Date.now().toString(),
        name: name,
        text: text,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedback)
        });
        
        if (response.ok) {
            alert('Thank you for your feedback! It will be displayed after review.');
            event.target.reset();
        }
    } catch (error) {
        alert('Error submitting feedback. Please try again.');
    }
}

async function loadApprovedFeedback() {
    try {
        const response = await fetch('/api/feedback/approved');
        const feedback = await response.json();
        
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';
        
        feedback.forEach(item => {
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerHTML = `
                <div class="comment-header">
                    <strong>${item.name}</strong>
                    <span>${new Date(item.date).toLocaleDateString()}</span>
                </div>
                <p>${item.text}</p>
            `;
            commentsList.appendChild(newComment);
        });
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

// Load approved feedback when page loads
document.addEventListener('DOMContentLoaded', loadApprovedFeedback);
