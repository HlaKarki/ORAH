# Testing Guide for Orah Agent Features

## Prerequisites
✅ Dev server is running at: **http://localhost:3000**
✅ Make sure you have `NEXT_PUBLIC_OPENAI_API_KEY` in your `.env.local` file
✅ Optional: `ELEVENLABS_API_KEY` for audio features

---

## 🎯 Complete Testing Flow

### **Step 1: First-Time User Experience (Input State)**

1. Open http://localhost:3000
2. You'll see the **Input Screen** with:
   - Text area for topic input
   - Microphone button for voice input
   - Example topics you can click
   - **Look for**: Profile icon in the top-right (should show "0" topics initially)

**Try this:**
- Type: "How does machine learning work?"
- Or click one of the example topics
- Or click the mic icon to record your voice (needs microphone permission)
- Click "Start Learning"

---

### **Step 2: Teaching State**

After submitting a topic, you'll see the **Teaching Screen**:

**What to observe:**
- 📚 AI-generated explanation (60-90 seconds worth of content)
- 🎵 Audio player if ElevenLabs is configured (optional)
- 👁️ "Show text" / "Hide text" toggle if audio is available
- 📋 Preview of the question you'll need to answer
- 🔘 "I'm ready to explain!" button (disabled until you listen to audio, if audio exists)

**Try this:**
- Read the teaching content carefully
- If audio is available, click play and listen
- Click "I'm ready to explain!" when ready

---

### **Step 3: Recording State**

Now you choose how to explain the concept back:

**Two modes available:**

#### **Voice Recording Mode** 🎤
1. Click "Voice Recording"
2. Click the big circular button to start recording
3. Speak your explanation (max 3 minutes)
4. Click "Pause" if needed
5. Click the button again to stop
6. Review the audio playback
7. Click "Submit Recording" or "Re-record"

#### **Type It Out Mode** ⌨️
1. Click "Type It Out"
2. Type your explanation (minimum 50 characters)
3. Character count shows at bottom
4. Click "Submit Explanation" when done

**Testing tip:**
- Try both modes to see how each works
- For voice: The app will transcribe your audio using ElevenLabs
- For text: It analyzes immediately

---

### **Step 4: Analysis State** 📊

After submitting your explanation, you'll see the **Analysis Dashboard**:

**Key features to observe:**

1. **Score Ring** (0-10 scale with color coding)
   - 8-10 = Green (Excellent)
   - 6-7 = Yellow (Good)
   - 4-5 = Orange (Partial)
   - 0-3 = Red (Needs work)

2. **Feedback Cards:**
   - ✅ Green card: "What You Nailed"
   - ❌ Red card: "What You Missed"
   - 💡 Blue card: "How to Improve"

3. **Next Question Preview** (purple card)

4. **Action Buttons:**
   - "Try Again (Same Question)" - Attempt #2
   - "Next Question →" - Move to next concept
   - "Practice with Quiz" - NEW! Enter quiz mode
   - "← Start with a new topic" - Back to input

**Testing paths:**

**Path A: Try Again**
- Click "Try Again (Same Question)"
- You'll return to Recording State
- Notice "Attempt #2" badge
- Submit a better explanation
- See improvement tracking in the graph

**Path B: Next Question**
- Click "Next Question →"
- Goes back to Teaching State with a new focus question
- System builds on what you learned

**Path C: Practice with Quiz** ⭐ NEW!
- Click "Practice with Quiz"
- Enters Quiz State (see Step 5)

---

### **Step 5: Quiz State** 🎮 NEW!

This is where you practice with generated quizzes:

**Setup Screen:**
1. See "Practice Quiz" interface
2. Topic displayed at top
3. Select difficulty:
   - Easy
   - Medium (default)
   - Hard
4. Click "Start Quiz (5 Questions)"
5. Wait for quiz generation (calls agent API)

**Quiz Interface:**
- Progress bar showing question X of 5
- Current score tracker
- Multiple choice questions (A, B, C, D)
- Click an answer to select it
- Click "Submit Answer" to check

**After submitting:**
- ✅ Correct answers show green
- ❌ Wrong answers show red
- See explanation of the correct answer
- Click "Next Question →" to continue
- Final question shows "Finish Quiz"

**Quiz completion:**
- Score is calculated (out of 10)
- Added to your profile as "[Topic] (Quiz)"
- Returns to Analysis State

**Testing tips:**
- Try different difficulty levels
- Intentionally get some wrong to see feedback
- Check how quiz score appears in your profile later

---

### **Step 6: Profile State** 👤 NEW!

Access your learning profile at any time:

**How to access:**
1. Click the profile icon in the top-right header
2. Shows number of topics studied

**Profile Dashboard sections:**

#### **Stats Overview (4 cards)**
- Topics Studied
- Average Score
- Total Attempts
- Mastered (score ≥ 8)

#### **Performance Trend**
- Visual bar chart of last 10 scores
- Trend indicator:
  - 🚀 "Rapidly Improving"
  - 📈 "Steadily Improving"
  - ➡️ "Stable Performance"
  - 📉 "Needs Focus"

#### **Learning Style** (NEW!)
- Shows detected preferences:
  - 🎭 Analogies preference
  - 🔬 Technical depth preference
  - 👁️ Visual learning preference
- Progress bars show strength (0-100%)
- Updates automatically based on your explanations

#### **Topics Breakdown**
Three categories with color coding:
- ✅ **Mastered** (green) - Score 8-10
- ⚡ **In Progress** (yellow) - Score 6-7
- 📚 **Needs More Practice** (red) - Score 0-5

#### **Profile Info**
- Member Since: When you first used the app
- Last Active: Last interaction timestamp

**Actions:**
- "Continue Learning" - Return to input state
- "Reset Profile" - Clear all data (requires confirmation)

---

## 🧪 Advanced Testing Scenarios

### **Scenario 1: Learning Style Adaptation**

Test how the system learns your preferences:

1. **First topic**: Explain using lots of analogies
   - e.g., "It's like a recipe that the computer follows..."
2. Check profile → Learning Style → Analogies bar should increase
3. **Second topic**: Start a new topic
4. Notice the teaching explanation adapts with more analogies!
5. **Third topic**: Use technical terms in your explanation
6. Profile shows increased technical preference
7. Future teaching becomes more technical

**Expected behavior:**
- System detects patterns in how you explain
- Adjusts teaching style to match your preferences
- You can see this in real-time in the profile dashboard

---

### **Scenario 2: Multiple Attempts on Same Topic**

Test the attempt tracking:

1. Learn a topic
2. Deliberately give a poor explanation (score < 6)
3. Click "Try Again (Same Question)"
4. Notice "Attempt #2" badge
5. Give a better explanation
6. Analysis dashboard shows improvement graph
7. Both attempts tracked with scores

**Expected behavior:**
- Graph shows multiple bars for attempts
- Shows +/- score change from previous attempt
- Profile records the BEST score, not the last

---

### **Scenario 3: Full Learning Path**

Complete learning journey:

1. **Input** → Choose "How do neural networks learn?"
2. **Teaching** → Read/listen to explanation
3. **Recording** → Explain back (voice or text)
4. **Analysis** → Get score and feedback (let's say 7/10)
5. **Quiz** → Click "Practice with Quiz" on Medium difficulty
6. Complete 5 questions (let's say 4/5 correct = 8/10 score)
7. **Profile** → View dashboard
   - See 2 entries: original topic + quiz
   - Performance trend graph shows both scores
   - Check learning style adaptations
8. **Next Question** → Continue with related concept
9. Repeat the cycle

---

### **Scenario 4: Profile Persistence**

Test localStorage memory:

1. Complete 2-3 topics with explanations
2. Check profile dashboard (note your stats)
3. **Refresh the page (F5 or Cmd+R)**
4. Profile icon still shows topic count
5. Click profile → All data persists!
6. Learning style preferences maintained
7. Topic history preserved

**Expected behavior:**
- All data survives page refresh
- No loss of progress
- Profile automatically loads on page load

---

### **Scenario 5: Quiz Difficulty Comparison**

Test quiz generation with different difficulties:

1. Learn a topic about "Blockchain"
2. Go to quiz mode
3. Try **Easy** difficulty first
   - Questions should be basic concepts
   - Simple multiple choice
4. Return to input, learn same topic again
5. Try **Hard** difficulty
   - Questions require deeper understanding
   - More nuanced options
   - Complex scenarios

---

## 🐛 Things to Check for Bugs

### **Memory/Profile Issues:**
- [ ] Profile icon shows correct count
- [ ] Stats calculate correctly
- [ ] Performance trend displays properly
- [ ] Learning style bars update (0-100%)
- [ ] Topics appear in correct categories
- [ ] Reset profile works and confirms
- [ ] Data persists after refresh

### **Quiz Issues:**
- [ ] Quiz generates successfully
- [ ] All 5 questions load
- [ ] Options A, B, C, D all work
- [ ] Can't change answer after submitting
- [ ] Explanation shows for all questions
- [ ] Score calculates correctly (out of 10)
- [ ] Progress bar advances
- [ ] Quiz completion returns to analysis

### **State Transitions:**
- [ ] Can navigate between all states
- [ ] Back button works where expected
- [ ] Profile accessible from any state
- [ ] Error messages display properly
- [ ] Loading spinners show during API calls

### **Learning Style Detection:**
- [ ] Using analogies increases analogy preference
- [ ] Technical terms increase technical preference
- [ ] Visual descriptions increase visual preference
- [ ] Changes reflect in profile dashboard
- [ ] Teaching adapts in subsequent topics

---

## 📱 Mobile Testing

The app is responsive, so test on different screen sizes:

1. Desktop (1920x1080)
2. Tablet (768px width)
3. Mobile (375px width)

**Check:**
- Profile button accessible on mobile
- Quiz questions readable on small screens
- Profile dashboard scrolls properly
- All buttons tap-friendly on mobile

---

## 🔍 Debug Tips

### Check Browser Console
- Open DevTools (F12 or Cmd+Opt+I)
- Look for errors in Console tab
- Check Network tab for API call failures

### Check localStorage
1. Open DevTools → Application tab
2. Storage → Local Storage → http://localhost:3000
3. Find key: `orah_learner_profile`
4. Click to see JSON data
5. Can manually delete to reset profile

### API Endpoints Being Called
- `/api/teach` - Teaching generation
- `/api/analyze` - Explanation analysis
- `/api/transcribe` - Audio transcription (if using voice)
- `/api/agent` - Quiz generation (tool calling)

---

## ✅ Success Criteria

You've successfully tested everything if:
- ✅ Completed at least 2 full learning cycles
- ✅ Tried both voice and text explanations
- ✅ Generated and completed at least 1 quiz
- ✅ Viewed profile dashboard with populated data
- ✅ Verified profile persistence after refresh
- ✅ Saw learning style adapt based on your explanations
- ✅ Navigated through all 6 states without errors

---

## 🆘 Troubleshooting

### "Failed to generate teaching"
- Check if `NEXT_PUBLIC_OPENAI_API_KEY` is set in `.env.local`
- Verify API key is valid
- Check browser console for errors

### "Failed to transcribe audio"
- Need `ELEVENLABS_API_KEY` for voice features
- Or use "Type It Out" mode instead

### Quiz not generating
- Check `/api/agent` endpoint in Network tab
- Verify OpenAI API key has function calling enabled
- Try refreshing and attempting again

### Profile not saving
- Check browser localStorage is enabled
- Try different browser if in incognito/private mode
- Check console for localStorage errors

---

## 🎉 Have Fun Testing!

The system learns from you as you use it. The more you interact, the better it adapts to your learning style. Try explaining things in different ways and watch how the AI adjusts its teaching approach!
