document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Thank you for reaching out! I will get back to you soon.');
});
document.addEventListener("DOMContentLoaded", function() {
    const bootText = `
Initializing System...
Loading Modules...
Setting Up Secure Environment...
Starting Shreyash's Portfolio...
System Ready. Welcome to the Matrix.
    `;

    const bootElement = document.getElementById("boot-text");
    bootElement.textContent = "";

    // Simulate typing effect
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < bootText.length) {
            bootElement.textContent += bootText.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            setTimeout(() => {
                document.getElementById("boot-animation").style.opacity = "0";
                setTimeout(() => {
                    document.getElementById("boot-animation").style.display = "none";
                }, 1000);
            }, 1000); // Delay before hiding the boot animation
        }
    }, 50); // Adjust typing speed
});
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");

    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible"); // Add fade-in effect
            } else {
                entry.target.classList.remove("visible"); // Remove fade-in effect (fade-out)
            }
        });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
