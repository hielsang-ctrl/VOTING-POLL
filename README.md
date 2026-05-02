# Voting Poll App — React Group Project

# Overview

The **Voting Poll App** is a simple and interactive React application that allows users to vote on poll options. It demonstrates core React concepts such as component structure, state management, props, event handling, and data persistence using `localStorage`.

This project is designed as a collaborative mini-project for practicing React development.


# Objectives

Structure a React app using multiple reusable components
Pass data and functions via props
Manage shared state in `App.jsx` using `useState`
Handle user interactions with React events (`onClick`, `onSubmit`, `onChange`)
Persist data using `localStorage`
Understand React data flow (props down, events up)
Build a responsive UI using Tailwind CSS or Bootstrap


# Tech Stack

*React 
*JavaScript XML
*Tailwind CSS 

# Features

Vote on poll options
Live vote count updates
Percentage-based progress bars
One vote per user (buttons disabled after voting)
Reset all votes with a single click
Persistent data using `localStorage`
Fully responsive design (mobile & desktop)
Clean UI with 3+ complementary colors


# State Management

All application state is stored in **`App.jsx`**
  Includes:

   Poll options
   Vote counts
   Voting status



# Components

# `App.jsx`

Root component
Holds all state
Handles logic for voting, adding options, and resetting

# `PollForm.jsx`

Input field for adding new poll options
Handles form submission

# `PollList.jsx`

* Renders list of poll options

# `PollOption.jsx`

  Displays:

Option name
Vote count
Percentage bar
Vote button


# Usage

1. Enter a poll option in the input field
2. Click **Add Option**
3. Click **Vote** on your preferred option
4. Observe vote count and percentage update
5. Click **Reset** to clear all votes



# Contributing

This is a group project with **6 contributors**.
