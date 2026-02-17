const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function updatePasswords() {
  // Hash "password123" with bcrypt
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Hashed password:', hashedPassword);

  // Connect to database
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'banking_system',
  });

  try {
    // Check users before update
    const [usersBefore] = await connection.execute(
      'SELECT id, name, email, role FROM users ORDER BY id',
    );

    console.log(`\nFound ${usersBefore.length} users in database`);

    // Update all users to have the same hashed password
    const [result] = await connection.execute('UPDATE users SET password = ?', [
      hashedPassword,
    ]);

    console.log(`Updated ${result.affectedRows} user passwords`);

    // Verify users after update
    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users ORDER BY id',
    );

    console.log('\nUsers in database:');
    users.forEach((user) => {
      console.log(`- ${user.email} (${user.role})`);
    });
  } finally {
    await connection.end();
  }
}

updatePasswords().catch(console.error);
