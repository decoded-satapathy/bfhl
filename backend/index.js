const express = require('express');
const { z } = require('zod');
require('express-async-errors');

const app = express();
app.use(express.json());

// Hardcoded values
const HARDCODED = {
  EMAIL: '22bcs14524@cuchd.in',
  ROLL_NUMBER: '22BCS14524',
  USER_ID: '22bcs14524_22082003' // Format: {user_id}_{ddmmyyyy}
};

// Zod Schema for validation
const postRequestSchema = z.object({
  data: z.array(z.union([z.string(), z.number()])).min(1)
});

// Validation Middleware
const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      is_success: false,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  req.validatedData = result.data;
  next();
};

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    is_success: false,
    message: err.message || 'Internal Server Error'
  });
});

// POST Endpoint
app.post('/bfhl', validateRequest(postRequestSchema), (req, res) => {
  const { data } = req.validatedData;

  const numbers = [];
  const alphabets = [];
  const alphabetsUpperCase = [];
  const invalidInputs = [];

  data.forEach(item => {
    const strItem = item.toString();
    if (!isNaN(strItem)) {
      numbers.push(strItem);
    } else if (/^[a-zA-Z]$/.test(strItem)) {
      alphabets.push(strItem);
      alphabetsUpperCase.push(strItem.toUpperCase());
    } else {
      invalidInputs.push(strItem);
    }
  });

  if (invalidInputs.length > 0) {
    return res.status(400).json({
      is_success: false,
      message: "Invalid input detected. Only single letters or numbers are allowed.",
      invalid_inputs: invalidInputs
    });
  }

  // Find highest alphabet(s)
  let highest_alphabet = [];
  if (alphabetsUpperCase.length > 0) {
    const maxCharCode = Math.max(...alphabetsUpperCase.map(c => c.charCodeAt(0)));
    highest_alphabet = alphabets.filter((c, index) =>
      alphabetsUpperCase[index].charCodeAt(0) === maxCharCode
    );
  }

  res.json({
    is_success: true,
    user_id: HARDCODED.USER_ID,
    email: HARDCODED.EMAIL,
    roll_number: HARDCODED.ROLL_NUMBER,
    numbers: numbers,
    alphabets: alphabets,
    highest_alphabet: highest_alphabet
  });
});

// GET Endpoint
app.get('/bfhl', (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
