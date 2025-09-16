const User = require('../models/user');
const Transaction = require('../models/transaction');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const generateFauxToken = (id) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-testing';
    return jwt.sign({ _id: id.toString() }, secret);
};

exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = new User({ email, password });
        await user.save();
        const token = generateFauxToken(user._id);
        res.status(201).send({ user, token });
    } catch (error) {
        console.error('Register user error:', error);
        res.status(400).send({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).send({ error: 'Invalid login credentials.' });
        }
        const token = generateFauxToken(user._id);
        res.send({ user, token });
    } catch (error) {
        console.error('Login user error:', error);
        res.status(500).send({ error: 'Server error.' });
    }
};

exports.fundAccount = async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount <= 0) {
            return res.status(400).send({ error: 'Amount must be positive.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }

        // Ensure balance is a number, default to 0 if undefined/null
        user.balance = (user.balance || 0) + amount;
        await user.save();

        const transaction = new Transaction({
            type: 'fund',
            amount,
            sender: user._id,
        });
        await transaction.save();

        res.send({ user, transaction });
    } catch (error) {
        console.error('Fund account error:', error);
        res.status(500).send({ error: 'Funding failed.' });
    }
};

exports.transferFunds = async (req, res) => {
    try {
        const { recipientEmail, amount } = req.body;
        if (amount <= 0) {
            return res.status(400).send({ error: 'Amount must be positive.' });
        }

        const sender = await User.findById(req.user._id);
        const receiver = await User.findOne({ email: recipientEmail });

        if (!sender) {
            return res.status(404).send({ error: 'Sender not found.' });
        }

        if (!receiver) {
            return res.status(404).send({ error: 'Recipient not found.' });
        }

        // Ensure balances are numbers, default to 0 if undefined/null
        const senderBalance = sender.balance || 0;
        const receiverBalance = receiver.balance || 0;

        if (senderBalance < amount) {
            return res.status(400).send({ error: 'Insufficient balance.' });
        }

        sender.balance = senderBalance - amount;
        receiver.balance = receiverBalance + amount;

        await sender.save();
        await receiver.save();

        const transaction = new Transaction({
            type: 'transfer',
            amount,
            sender: sender._id,
            receiver: receiver._id,
        });
        await transaction.save();

        res.send({ message: 'Transfer successful.', sender, receiver, transaction });
    } catch (error) {
        console.error('Transfer funds error:', error);
        res.status(500).send({ error: 'Transfer failed.' });
    }
};

exports.withdrawFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount <= 0) {
            return res.status(400).send({ error: 'Amount must be positive.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }

        // Ensure balance is a number, default to 0 if undefined/null
        const userBalance = user.balance || 0;

        if (userBalance < amount) {
            return res.status(400).send({ error: 'Insufficient balance.' });
        }

        user.balance = userBalance - amount;
        await user.save();

        const transaction = new Transaction({
            type: 'withdraw',
            amount,
            sender: user._id,
        });
        await transaction.save();

        res.send({ user, transaction });
    } catch (error) {
        console.error('Withdraw funds error:', error);
        res.status(500).send({ error: 'Withdrawal failed.' });
    }
};
