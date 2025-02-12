
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value; // Added name field
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;

  const response = await window.electronAPI.register({ name, username, password });
  document.getElementById('message').innerText = response.message;
});


document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const response = await window.electronAPI.login({ username, password });

  if (response.success) {
    const verificationResponse = await window.electronAPI.verifyToken(response.token);
    document.getElementById('message').innerText = verificationResponse.success
      ? 'Login successful!'
      : 'Token verification failed';
  } else {
    document.getElementById('message').innerText = response.message;
  }
});
