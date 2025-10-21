const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let users = [
	{
		id: '2f02',
		email: 'thong1',
		password: '111',
	},
	{
		email: 'fdsfd',
		password: 'fdf',
	},
];

let credentials = [
	{
		id: 'fdcd',
		domain: 'coupang.com',
		icon: 'https://image10.coupangcdn.com/image/mobile/v3/web_favicon.png',
		inputRules: {
			password: {
				fieldRules: {
					rules: [],
					type: 'password',
				},
				placeholderRules: {
					rules: [],
				},
				valueRules: {
					length: 15,
					rules: ['letter', 'number', 'uppercase', 'lowercase'],
					type: 'text',
				},
			},
			username: {
				fieldRules: {
					rules: ['maxlength'],
					type: 'email',
				},
				placeholderRules: {
					rules: [],
				},
				valueRules: {
					length: 28,
					rules: ['letter', 'number', 'special', 'lowercase'],
					type: 'email',
				},
			},
		},
		multipleStep: false,
		password: 'Thong0909310872',
		timestamp: 1761012499864,
		url: 'https://www.coupang.com',
		username: 'trannhutthong1999x@gmail.com',
	},
];

// Session storage
let sessions = new Map(); // token -> { userId, user, createdAt, lastAccess }
let userSessions = new Map(); // userId -> Set of tokens

// Domain storage
let firstAutoLoginDomains = new Set(); // Set of domains for first auto login

// Helper function to generate random token
function generateToken() {
	return uuidv4() + '-' + Date.now();
}

// Helper function to find user by email
function findUserByEmail(email) {
	return users.find((user) => user.email === email);
}

// Helper function to find user by token
function findUserByToken(token) {
	const session = sessions.get(token);
	if (!session) return null;

	// Update last access time
	session.lastAccess = Date.now();
	return session.user;
}

// Helper function to create session
function createSession(user) {
	const token = generateToken();
	const session = {
		userId: user.id,
		user: {
			id: user.id,
			email: user.email,
		},
		createdAt: Date.now(),
		lastAccess: Date.now(),
	};

	sessions.set(token, session);

	// Track user sessions
	if (!userSessions.has(user.id)) {
		userSessions.set(user.id, new Set());
	}
	userSessions.get(user.id).add(token);

	return token;
}

// Helper function to remove session
function removeSession(token) {
	const session = sessions.get(token);
	if (session) {
		const userId = session.userId;
		sessions.delete(token);

		// Remove from user sessions
		if (userSessions.has(userId)) {
			userSessions.get(userId).delete(token);
			if (userSessions.get(userId).size === 0) {
				userSessions.delete(userId);
			}
		}
	}
}

// AUTH ENDPOINTS

// POST /user (login)
app.post('/user', (req, res) => {
	const { email, password } = req.body;

	const user = findUserByEmail(email);
	if (!user || user.password !== password) {
		return res.status(401).json({
			message: 'Invalid credentials',
			success: false,
		});
	}

	const token = createSession(user);

	res.json({
		success: true,
		token,
		user: {
			id: user.id,
			email: user.email,
		},
	});
});

// POST /auth/logout
app.post('/auth/logout', (req, res) => {
	const token = req.headers.authorization?.replace('Bearer ', '');
	if (token) {
		removeSession(token);
	}
	res.json({ success: true, message: 'Logged out successfully' });
});

// GET /auth/me
app.get('/auth/me', (req, res) => {
	const token = req.headers.authorization?.replace('Bearer ', '');

	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	const user = findUserByToken(token);
	if (!user) {
		return res.status(401).json({ message: 'Invalid token' });
	}

	res.json({
		success: true,
		user: {
			id: user.id,
			email: user.email,
		},
	});
});

// POST /auth/refresh-token
app.post('/auth/refresh-token', (req, res) => {
	const token = req.headers.authorization?.replace('Bearer ', '');

	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	const user = findUserByToken(token);
	if (!user) {
		return res.status(401).json({ message: 'Invalid token' });
	}

	// Generate new token
	const newToken = generateToken();
	tokens.delete(token);
	tokens.set(newToken, user.id);

	res.json({
		success: true,
		token: newToken,
	});
});

// CREDENTIAL ENDPOINTS

// GET /credential
app.get('/credential', (req, res) => {
	const { domain } = req.query;

	let filteredCredentials = credentials;
	if (domain) {
		filteredCredentials = credentials.filter((cred) =>
			cred.domain.toLowerCase().includes(domain.toLowerCase())
		);
	}

	res.json(filteredCredentials);
});

// POST /credential
app.post('/credential', (req, res) => {
	const newCredential = {
		id: uuidv4(),
		...req.body,
		timestamp: Date.now(),
	};

	credentials.push(newCredential);
	res.status(201).json(newCredential);
});

// PUT /credential/:id
app.put('/credential/:id', (req, res) => {
	const { id } = req.params;
	const index = credentials.findIndex((cred) => cred.id === id);

	if (index === -1) {
		return res.status(404).json({ message: 'Credential not found' });
	}

	credentials[index] = {
		...credentials[index],
		...req.body,
		id,
		timestamp: Date.now(),
	};

	res.json(credentials[index]);
});

// DELETE /credential/:id
app.delete('/credential/:id', (req, res) => {
	const { id } = req.params;
	const index = credentials.findIndex((cred) => cred.id === id);

	if (index === -1) {
		return res.status(404).json({ message: 'Credential not found' });
	}

	credentials.splice(index, 1);
	res.json({ success: true, message: 'Credential deleted' });
});

// DOMAIN ENDPOINTS

// POST /domain/first-auto-login - Add domain to first auto login
app.post('/domain/first-auto-login', (req, res) => {
	const { domain } = req.body;

	if (!domain || typeof domain !== 'string') {
		return res.status(400).json({
			success: false,
			message: 'Domain is required and must be a string',
		});
	}

	// Add domain to set (automatically handles duplicates)
	firstAutoLoginDomains.add(domain);

	res.json({
		success: true,
		message: `Added domain to first auto login: ${domain}`,
		domain,
	});
});

// GET /domain/first-auto-login - Get all first auto login domains
app.get('/domain/first-auto-login', (req, res) => {
	const domains = Array.from(firstAutoLoginDomains);
	res.json({
		success: true,
		domains,
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 API Server running on http://localhost:${PORT}`);
	console.log('📋 Available endpoints:');
	console.log('  POST /user - Login');
	console.log('  POST /auth/logout - Logout');
	console.log('  GET /auth/me - Get current user');
	console.log('  POST /auth/refresh-token - Refresh token');
	console.log('  GET /credential - Get all credentials');
	console.log('  POST /credential - Create credential');
	console.log('  PUT /credential/:id - Update credential');
	console.log('  DELETE /credential/:id - Delete credential');
	console.log(
		'  POST /domain/first-auto-login - Add domain to first auto login'
	);
	console.log(
		'  GET /domain/first-auto-login - Get all first auto login domains'
	);
});
