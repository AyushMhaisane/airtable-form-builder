const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');

dotenv.config();

connectDB();

const app = express();


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',           
  'http://localhost:5174',            
  process.env.CLIENT_URL              
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/', (req, res) => {
  res.send('Airtable Form Builder API is running...');
});



app.use('/api/forms', formRoutes);
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});