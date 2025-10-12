export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  content: string[];
  exercises?: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Curriculum {
  id: string;
  modules: Module[];
}

export const curriculumData: Record<string, Curriculum> = {
  foundations: {
    id: "foundations",
    modules: [
      {
        id: "module-1",
        title: "Introduction to Logos",
        description: "Understanding logic as divine structure and sacred reasoning",
        lessons: [
          {
            id: "lesson-1",
            title: "What is Logos?",
            description: "The divine principle of reason and order",
            duration: "25 min",
            content: [
              "📖 FOUNDATION: The term 'Logos' (λόγος) appears in John 1:1: 'In the beginning was the Word (Logos), and the Word was with God, and the Word was God.' This single verse reveals that logic, reason, and divine order are not human inventions—they flow from the very nature of God.",
              "The ancient Greeks used 'Logos' to describe the rational principle governing the cosmos. When John uses it to describe Christ, he's declaring that Jesus is the embodiment of divine reason itself. All truth, all order, all coherence in the universe finds its source in Him.",
              "💡 KEY INSIGHT: Logic is not cold, mechanical calculation. It is the warm, living structure through which truth becomes visible to created minds. Just as a building needs a framework to stand, reality needs logical structure to be comprehensible.",
              "When we study logic, we're not learning arbitrary rules invented by philosophers. We're discovering the architecture of reality—the way God structured creation. Every valid argument is a small reflection of divine order.",
              "Consider this: Why can we trust our reasoning at all? Because we're made in the image of a rational God. Our ability to think logically is a gift that allows us to know truth, including truth about God Himself.",
              "🎯 PRACTICAL APPLICATION: This means that developing logical thinking is spiritual discipline. Just as prayer connects us to God's heart, logic connects us to God's mind. Both are essential for mature faith.",
            ],
            exercises: [
              "MEDITATION: Read John 1:1-14 slowly. Journal about how seeing Christ as 'Logos' changes your understanding of logic and reason.",
              "REFLECTION: How does understanding logic as 'sacred structure' change your view of reasoning? Write 3-5 sentences.",
              "TESTIMONY: Write about a specific time when clear, logical thinking helped you see spiritual truth more clearly. What was the situation? What was the breakthrough?",
              "PRAYER: Thank God for the gift of reason and ask Him to help you develop clarity of thought in service of truth.",
            ],
          },
          {
            id: "lesson-2",
            title: "Deductive Reasoning",
            description: "Moving from universal truths to specific conclusions",
            duration: "30 min",
            content: [
              "📖 DEFINITION: Deductive reasoning moves from general principles to specific conclusions. If your premises are true and your reasoning is valid, your conclusion MUST be true. This is the gold standard of logical certainty.",
              "STRUCTURE: A deductive argument has this form:\n• Premise 1 (General principle)\n• Premise 2 (Specific case)\n• Conclusion (What necessarily follows)",
              "🎓 CLASSIC EXAMPLE:\nPremise 1: All humans are mortal.\nPremise 2: Socrates is human.\nConclusion: Therefore, Socrates is mortal.\n\nThis is airtight. If both premises are true, the conclusion cannot be false.",
              "✝️ THEOLOGICAL EXAMPLE:\nPremise 1: God is love (1 John 4:8)\nPremise 2: God created you (Genesis 1:27)\nConclusion: Therefore, you were created in love.\n\nThis gives us absolute certainty about God's intentions for us.",
              "💡 WHY IT MATTERS: Deductive logic is the logic of revelation. God reveals universal truths in Scripture, and we apply them to our specific situations. When we read 'God will never leave you' (Hebrews 13:5), we can deduce: 'God will never leave me, even in this trial.'",
              "⚠️ CRITICAL POINT: Deductive arguments are only as strong as their premises. If a premise is false, the conclusion may be false even if the logic is valid. Always check your starting points!",
              "🔍 VALIDITY vs. SOUNDNESS:\n• Valid = Correct structure (conclusion follows from premises)\n• Sound = Valid + True premises\n\nWe want SOUND arguments—both correct structure and true content.",
              "EXAMPLE OF VALID BUT UNSOUND:\nPremise 1: All cats can fly.\nPremise 2: Fluffy is a cat.\nConclusion: Therefore, Fluffy can fly.\n\n(Valid structure, but false premise makes it unsound)",
            ],
            exercises: [
              "CONSTRUCTION: Create a deductive argument about God's faithfulness using Lamentations 3:22-23 as your first premise.",
              "IDENTIFICATION: Analyze this argument—identify Premise 1, Premise 2, and Conclusion: 'All Scripture is God-breathed. 2 Timothy is Scripture. Therefore, 2 Timothy is God-breathed.' Is it valid? Is it sound?",
              "APPLICATION: Think of a current struggle. Find a universal truth from Scripture (premise 1), identify your situation (premise 2), and write the conclusion that follows.",
              "EVALUATION: 'All Christians go to church. John goes to church. Therefore, John is a Christian.' Is this argument valid? Why or why not? (Hint: Think carefully about the logic structure)",
              "PRACTICE: Write three deductive arguments—one about God's love, one about salvation, and one about obedience. Make sure each is sound.",
            ],
          },
          {
            id: "lesson-3",
            title: "Inductive Reasoning",
            description: "Building general truths from specific observations",
            duration: "30 min",
            content: [
              "📖 DEFINITION: Inductive reasoning moves from specific observations to general conclusions. Unlike deduction, induction doesn't guarantee certainty—it establishes probability based on patterns and evidence.",
              "STRUCTURE: Inductive reasoning follows this pattern:\n• Observation 1 (Specific instance)\n• Observation 2 (Specific instance)\n• Observation 3+ (More instances)\n• Conclusion (General principle)",
              "🎓 EVERYDAY EXAMPLE:\nObservation: The sun rose this morning.\nObservation: The sun rose yesterday.\nObservation: The sun has risen every day in recorded history.\nConclusion: The sun will probably rise tomorrow.\n\nNotice: We say 'probably,' not 'certainly.' That's the nature of induction.",
              "✝️ SPIRITUAL EXAMPLE:\nWitness 1: God answered my prayer about finances.\nWitness 2: God healed my friend when we prayed.\nWitness 3: Scripture records countless answered prayers.\nConclusion: Prayer is effective and God responds.\n\nThis is the logic of testimony—building confidence through accumulated evidence.",
              "💡 THE ROLE OF FAITH: Inductive reasoning is deeply biblical. Hebrews 11:1 says faith is 'confidence in what we hope for and assurance about what we do not see.' We build that confidence through experiencing God's faithfulness repeatedly.",
              "🔍 STRENGTH OF INDUCTION: The more observations, the stronger the conclusion. One answered prayer is encouraging. A lifetime of answered prayers builds unshakable conviction.",
              "⚠️ WEAKNESS OF INDUCTION: It's always possible (though sometimes improbable) that the pattern could break. This is why faith isn't blind—it's trust based on evidence, but it still requires trust beyond absolute proof.",
              "COMPARING DEDUCTION & INDUCTION:\n• Deduction: 'If these truths hold, this MUST follow' (certainty)\n• Induction: 'Based on this pattern, this PROBABLY follows' (probability)\n• Deduction starts with universal truth; induction builds toward it\n• Deduction is top-down; induction is bottom-up",
              "🎯 APOLOGETIC POWER: Inductive reasoning is powerful in evangelism. We can point to:\n• Historical evidence for resurrection\n• Changed lives throughout history\n• Fulfilled prophecy\n• Personal testimonies\nEach adds weight, building a compelling cumulative case.",
            ],
            exercises: [
              "PERSONAL TESTIMONY: Write down 5 specific times God has been faithful to you. What general conclusion can you draw inductively?",
              "COMPARISON: Explain the difference between deductive and inductive reasoning to a friend. Use examples from everyday life and from faith.",
              "EVALUATION: How many observations do you think are needed for a strong inductive argument? Does it depend on the claim? Explain.",
              "HISTORICAL EVIDENCE: Research the historical evidence for Jesus' resurrection. List 5 pieces of evidence. What conclusion can be drawn inductively?",
              "WITNESSING PRACTICE: How would you use inductive reasoning to share your faith with someone who says 'I need proof God exists'? Write a brief dialogue.",
              "JOURNAL: Has there been a time when inductive reasoning strengthened your faith? Or weakened it? What happened?",
            ],
          },
        ],
      },
      {
        id: "module-2",
        title: "Argument Structure",
        description: "Understanding premises, conclusions, and validity",
        lessons: [
          {
            id: "lesson-4",
            title: "Premises and Conclusions",
            description: "The building blocks of all arguments",
            duration: "25 min",
            content: [
              "📖 CORE CONCEPT: Every argument—whether in philosophy, theology, or everyday conversation—consists of two essential components: premises (the evidence/reasons) and a conclusion (the claim being supported).",
              "🏗️ STRUCTURE:\n• PREMISES = The foundation (supporting statements)\n• CONCLUSION = The building (what you're trying to prove)\n\nJust as a building needs a solid foundation, a conclusion needs strong premises.",
              "🎓 SIMPLE EXAMPLE:\nPremise 1: All dogs are mammals.\nPremise 2: Buddy is a dog.\nConclusion: Therefore, Buddy is a mammal.\n\nThe conclusion is what we're proving. The premises are our reasons.",
              "✝️ BIBLICAL EXAMPLE (Romans 5:8):\nPremise 1: God demonstrates His love for us in this:\nPremise 2: While we were still sinners, Christ died for us.\nConclusion: Therefore, God loves even sinners.\n\nPaul structures his theology like an argument—premises leading to conclusion.",
              "🔍 IDENTIFYING ARGUMENTS: Look for indicator words:\n• PREMISE indicators: 'because,' 'since,' 'for,' 'given that,' 'as shown by'\n• CONCLUSION indicators: 'therefore,' 'thus,' 'so,' 'it follows that,' 'consequently'\n\nExample: 'Jesus is Lord BECAUSE He rose from the dead, THEREFORE we should follow Him.'",
              "💡 WHY THIS MATTERS: When you can identify premises and conclusions, you can:\n1. Understand what someone is really claiming\n2. Evaluate whether their reasons actually support their claim\n3. Construct your own persuasive arguments\n4. Spot weak reasoning in deceptive arguments",
              "⚠️ HIDDEN PREMISES: Sometimes premises are unstated (implied). Example: 'He's a pastor, so he must be trustworthy.'\n• Stated premise: He's a pastor\n• Hidden premise: All pastors are trustworthy\n• Conclusion: He must be trustworthy\n\nAlways look for unstated assumptions!",
              "🎯 TESTING PREMISES: Ask three questions:\n1. Are the premises true? (Truth)\n2. Are the premises relevant to the conclusion? (Relevance)\n3. Do the premises provide enough support? (Sufficiency)",
            ],
            exercises: [
              "SCRIPTURE ANALYSIS: Read Romans 3:23-24. Identify the premises and conclusion in Paul's argument about justification.",
              "IDENTIFICATION PRACTICE: In this statement, identify premises and conclusion: 'Since all humans are created in God's image, and you are human, you have inherent dignity and worth.'",
              "CONSTRUCTION: Build your own argument with at least two premises about why we should love our enemies (Matthew 5:44). Make your conclusion clear.",
              "HIDDEN PREMISE DETECTION: 'She goes to church every week, so she must be a genuine Christian.' What's the hidden premise? Is it true?",
              "REAL-WORLD APPLICATION: Listen to a sermon or Christian podcast this week. Identify one argument the speaker makes. Write out the premises and conclusion.",
              "EVALUATION: Construct an argument for why Christians should care for the poor. Use at least 3 premises from Scripture. Test your premises for truth, relevance, and sufficiency.",
            ],
          },
          {
            id: "lesson-5",
            title: "Validity vs. Soundness",
            description: "The difference between good form and true content",
            duration: "30 min",
            content: [
              "📖 TWO ESSENTIAL CONCEPTS: Understanding validity and soundness is crucial for evaluating arguments. These are the twin pillars of logical reasoning.",
              "🔍 VALIDITY (Form/Structure):\nAn argument is VALID when its conclusion logically follows from its premises. If the premises were true, the conclusion would have to be true.\n\nKey: Validity is about STRUCTURE, not truth.",
              "🎓 VALID ARGUMENT EXAMPLE:\nPremise 1: All birds can fly.\nPremise 2: Penguins are birds.\nConclusion: Therefore, penguins can fly.\n\nThis is VALID (correct structure) but UNSOUND (false premise). If all birds could fly, then penguins could fly. The logic works even though premise 1 is false.",
              "🔍 SOUNDNESS (Form + Truth):\nAn argument is SOUND when:\n1. It is valid (correct structure)\n2. All its premises are actually true\n\nSoundness = Validity + Truth\n\nSound arguments are what we're after—they prove their conclusions.",
              "✅ SOUND ARGUMENT EXAMPLE:\nPremise 1: All humans need oxygen to survive.\nPremise 2: You are human.\nConclusion: Therefore, you need oxygen to survive.\n\nThis is both VALID (correct structure) and SOUND (true premises).",
              "✝️ BIBLICAL APPLICATION:\nSOUND: 'God cannot lie (Titus 1:2). God promised eternal life. Therefore, God will give eternal life.' (Valid + true premises = Sound)\n\nUNSOUND: 'God always gives us what we want. I want a million dollars. Therefore, God will give me a million dollars.' (Valid structure, but first premise is false)",
              "💡 WHY THIS DISTINCTION MATTERS:\n• An argument can be logically flawless but based on lies\n• We must check BOTH structure and truth\n• Satan uses valid arguments with false premises (Genesis 3:4-5)\n• Apologetics requires sound arguments—not just clever reasoning",
              "⚠️ COMMON CONFUSION: People often say an argument is 'invalid' when they mean 'unsound.' Learn to distinguish:\n• 'That argument is invalid' = The conclusion doesn't follow\n• 'That argument is unsound' = The structure is fine, but a premise is false",
              "🎯 TESTING ARGUMENTS:\nStep 1: Check validity - Does the conclusion follow?\nStep 2: Check truth - Are the premises actually true?\nStep 3: If both pass, the argument is sound and proves its point.",
              "📊 FOUR POSSIBILITIES:\n1. Valid + True premises = SOUND ✅\n2. Valid + False premise(s) = UNSOUND ❌\n3. Invalid + True premises = UNSOUND ❌\n4. Invalid + False premises = UNSOUND ❌\n\nOnly #1 proves anything.",
            ],
            exercises: [
              "VALIDITY CHECK: Is this valid? 'All Christians love God. John loves God. Therefore, John is a Christian.' Explain why or why not. (Hint: Think about whether the conclusion MUST follow)",
              "SOUNDNESS CHECK: 'All Scripture is inspired by God (2 Tim 3:16). The Gospel of John is Scripture. Therefore, the Gospel of John is inspired by God.' Is this sound? Why?",
              "CREATE AN UNSOUND ARGUMENT: Write a valid argument with at least one false premise. Then fix it to make it sound.",
              "REAL-WORLD EVALUATION: 'Successful people wake up early. I wake up early. Therefore, I will be successful.' Analyze this argument's validity and soundness.",
              "APOLOGETICS APPLICATION: Create a sound argument for the resurrection using these facts: (1) Jesus died by crucifixion, (2) The tomb was found empty, (3) The disciples claimed to see Him alive.",
              "CRITICAL THINKING: Why is it dangerous to accept valid but unsound arguments? Give an example from false teaching you've encountered.",
              "PRACTICE: Find an argument in an article or social media post. Evaluate: Is it valid? Is it sound? Explain your reasoning.",
            ],
          },
        ],
      },
    ],
  },
  
  fallacies: {
    id: "fallacies",
    modules: [
      {
        id: "module-1",
        title: "Introduction to Fallacies",
        description: "Recognizing shadows that masquerade as light",
        lessons: [
          {
            id: "lesson-1",
            title: "What Are Fallacies?",
            description: "Errors in reasoning that appear persuasive",
            duration: "15 min",
            content: [
              "Fallacies are flaws in reasoning that undermine arguments. They look like logic but lack its substance.",
              "Some fallacies attack people instead of ideas. Others appeal to emotion rather than reason. Still others make false connections.",
              "In spiritual warfare, fallacies are weapons of confusion. The enemy uses bad logic to cloud truth.",
              "Learning to spot fallacies is protective wisdom—it guards your mind against deception.",
            ],
            exercises: [
              "Why is it important for Christians to recognize fallacies?",
              "Can you think of a time when you were persuaded by something that felt wrong?",
            ],
          },
          {
            id: "lesson-2",
            title: "Ad Hominem Attacks",
            description: "Attacking the person instead of the argument",
            duration: "20 min",
            content: [
              "Ad hominem means 'to the person.' This fallacy attacks someone's character instead of addressing their argument.",
              "Example: 'You can't trust his view on morality—he's been divorced!' (His personal life doesn't invalidate his argument)",
              "Jesus was often attacked ad hominem: 'Can anything good come from Nazareth?' (John 1:46)",
              "Counter it by redirecting: 'Let's focus on the argument itself, not the person making it.'",
            ],
            exercises: [
              "Find an example of ad hominem in online religious debates.",
              "How would you respond if someone dismissed your faith because of a mistake you made?",
            ],
          },
          {
            id: "lesson-3",
            title: "Straw Man Fallacy",
            description: "Distorting an opponent's position to make it easier to attack",
            duration: "20 min",
            content: [
              "A straw man argument misrepresents someone's position, then attacks the distorted version.",
              "Example: 'Christians say only Christians can be good people!' (Misrepresentation) 'That's obviously false!' (Easy attack)",
              "Real position: 'Ultimate goodness comes from God, but God's common grace allows non-Christians to do good.'",
              "Counter it: 'That's not what I said. Let me clarify my actual position...'",
            ],
            exercises: [
              "Identify the straw man: 'Atheists say life has no meaning.' Correct it.",
              "Practice restating someone's argument accurately before responding to it.",
            ],
          },
        ],
      },
      {
        id: "module-2",
        title: "Emotional Fallacies",
        description: "When feelings replace reasoning",
        lessons: [
          {
            id: "lesson-4",
            title: "Appeal to Emotion",
            description: "Using feelings to bypass reason",
            duration: "20 min",
            content: [
              "An appeal to emotion manipulates feelings instead of providing evidence.",
              "Example: 'How can you believe in a God who allows suffering?' (Appeals to pain rather than examining evidence)",
              "Emotions are real and important, but they don't determine truth. Truth must be evaluated on its own merits.",
              "Response: 'I understand that pain. Let's explore the evidence and reasoning together.'",
            ],
            exercises: [
              "Identify appeals to emotion in apologetics debates.",
              "How can you acknowledge emotions while still prioritizing truth?",
            ],
          },
          {
            id: "lesson-5",
            title: "Appeal to Popularity",
            description: "Believing something because many people do",
            duration: "15 min",
            content: [
              "This fallacy claims something is true because it's popular (argumentum ad populum).",
              "Example: 'Most people don't believe in absolute truth anymore, so it must not exist.'",
              "Jesus warned about this: 'Enter through the narrow gate... only a few find it.' (Matthew 7:13-14)",
              "Truth is not determined by majority vote. Many have believed lies; few have walked the narrow way.",
            ],
            exercises: [
              "Find examples of appeal to popularity in modern culture.",
              "Why is it hard to stand for unpopular truths? How can logic help?",
            ],
          },
        ],
      },
    ],
  },
  
  apologetics: {
    id: "apologetics",
    modules: [
      {
        id: "module-1",
        title: "Foundations of Apologetics",
        description: "Giving reasons for the hope within you",
        lessons: [
          {
            id: "lesson-1",
            title: "What is Apologetics?",
            description: "Defending faith with reason and reverence",
            duration: "20 min",
            content: [
              "Apologetics comes from the Greek 'apologia'—a defense or reasoned argument. It is the practice of defending Christian truth claims with logic and evidence.",
              "1 Peter 3:15: 'Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.'",
              "Apologetics is not about winning arguments—it's about removing obstacles so people can see Christ clearly.",
              "We defend the faith not because God needs our help, but because people need clarity and truth.",
            ],
            exercises: [
              "Why does God command us to give reasons for our faith?",
              "Reflect: What questions about Christianity do you struggle to answer?",
            ],
          },
          {
            id: "lesson-2",
            title: "The Cosmological Argument",
            description: "Why must there be a First Cause?",
            duration: "25 min",
            content: [
              "The cosmological argument reasons from the existence of the universe to the existence of God.",
              "1. Everything that begins to exist has a cause. 2. The universe began to exist. 3. Therefore, the universe has a cause.",
              "That cause must be timeless, spaceless, immaterial, and powerful—qualities consistent with God.",
              "Scientific evidence: The Big Bang shows the universe had a beginning. Something (or Someone) must have caused it.",
            ],
            exercises: [
              "Why can't the universe cause itself?",
              "How would you respond to: 'Who created God?'",
            ],
          },
          {
            id: "lesson-3",
            title: "The Moral Argument",
            description: "Objective morality points to a Moral Lawgiver",
            duration: "25 min",
            content: [
              "If objective moral values exist, they require an objective moral foundation—God.",
              "1. If God does not exist, objective moral values do not exist. 2. Objective moral values do exist. 3. Therefore, God exists.",
              "We all recognize certain acts (like torturing babies for fun) as objectively wrong, not just culturally unacceptable.",
              "Without God, morality becomes opinion. With God, morality is grounded in His eternal nature.",
            ],
            exercises: [
              "Why can't morality be based on human opinion alone?",
              "Respond to: 'I don't need God to be good.'",
            ],
          },
        ],
      },
      {
        id: "module-2",
        title: "Defending the Resurrection",
        description: "The cornerstone of Christian faith",
        lessons: [
          {
            id: "lesson-4",
            title: "Historical Evidence for the Resurrection",
            description: "Did Jesus really rise from the dead?",
            duration: "30 min",
            content: [
              "The resurrection is the most well-attested event in ancient history. Four minimal facts are nearly universally accepted by scholars:",
              "1. Jesus died by crucifixion. 2. His disciples believed they saw Him risen. 3. Skeptics (Paul, James) converted after seeing Him. 4. The tomb was found empty.",
              "Alternative theories (hallucination, conspiracy, swoon) fail to account for all the evidence together.",
              "The best explanation: Jesus actually rose from the dead, validating His divine claims.",
            ],
            exercises: [
              "Why would the disciples die for a lie if they made up the resurrection?",
              "Research one alternative theory and explain why it fails.",
            ],
          },
        ],
      },
    ],
  },
  
  witnessing: {
    id: "witnessing",
    modules: [
      {
        id: "module-1",
        title: "The Art of Conversational Witness",
        description: "Sharing truth with grace and discernment",
        lessons: [
          {
            id: "lesson-1",
            title: "Listening Before Speaking",
            description: "The first step in effective witness",
            duration: "15 min",
            content: [
              "James 1:19: 'Everyone should be quick to listen, slow to speak...'",
              "Before sharing truth, listen deeply. Understand where someone is coming from—their doubts, their pain, their questions.",
              "Listening builds trust. It shows you care about them as a person, not just as a conversion project.",
              "Ask open-ended questions: 'What do you think about...?' 'How did you come to believe that?'",
            ],
            exercises: [
              "Practice active listening in a conversation this week.",
              "Why is it tempting to speak before listening?",
            ],
          },
          {
            id: "lesson-2",
            title: "Answering Emotional Objections",
            description: "When the head follows the heart",
            duration: "20 min",
            content: [
              "Many objections to Christianity are emotional, not intellectual: 'How could a good God allow evil?'",
              "Don't rush to logic. Acknowledge the emotion: 'That's a painful question. I've struggled with it too.'",
              "Then gently guide toward reasoning: 'Can I share what helped me think through this?'",
              "Blend truth with compassion. Logic without love is cold; love without logic is blind.",
            ],
            exercises: [
              "Role-play: Respond to 'A loving God wouldn't send people to hell.'",
              "What emotions might be behind this objection?",
            ],
          },
          {
            id: "lesson-3",
            title: "Asking Strategic Questions",
            description: "Guiding people to discover truth themselves",
            duration: "20 min",
            content: [
              "Jesus often answered questions with questions: 'What do you think?' (Matthew 18:12)",
              "Strategic questions help people examine their own beliefs: 'What evidence would you need to believe?' 'How do you define good?'",
              "Questions disarm defensiveness. They invite dialogue instead of debate.",
              "Follow the Socratic method: Ask, don't tell. Guide, don't force.",
            ],
            exercises: [
              "Prepare three questions to ask someone who says 'All religions are the same.'",
              "Why are questions more effective than statements?",
            ],
          },
        ],
      },
      {
        id: "module-2",
        title: "Wisdom in Witness",
        description: "Knowing when to speak and when to wait",
        lessons: [
          {
            id: "lesson-4",
            title: "Discerning the Right Time",
            description: "Timing is everything in witness",
            duration: "15 min",
            content: [
              "Ecclesiastes 3:7: 'A time to be silent and a time to speak.'",
              "Not every moment is right for evangelism. Sometimes people need space, time, or just a friend.",
              "Look for open doors: genuine questions, curiosity, readiness. Don't force it.",
              "Pray for discernment. The Holy Spirit will guide your timing.",
            ],
            exercises: [
              "Reflect: Have you ever pushed too hard in witness? What happened?",
              "How can you tell when someone is ready to hear?",
            ],
          },
        ],
      },
    ],
  },
  
  scripture: {
    id: "scripture",
    modules: [
      {
        id: "module-1",
        title: "Logic in Biblical Texts",
        description: "Seeing the divine structure of Scripture",
        lessons: [
          {
            id: "lesson-1",
            title: "Argument Structures in Paul's Epistles",
            description: "Romans as a masterpiece of logic",
            duration: "25 min",
            content: [
              "Paul's letters are carefully structured arguments. Romans is essentially a theological treatise built on logical progression.",
              "Romans 1-3: All have sinned (premise). Romans 3-5: Justification through faith (solution). Romans 6-8: New life in the Spirit (application).",
              "Paul uses syllogisms, rhetorical questions, and evidence from Scripture to build his case.",
              "Understanding the logic helps us understand the theology more deeply.",
            ],
            exercises: [
              "Outline the logical flow of Romans 5:1-11.",
              "Identify Paul's premises and conclusion in Romans 8:31-39.",
            ],
          },
          {
            id: "lesson-2",
            title: "Jesus' Use of Logic",
            description: "How Christ reasoned with opponents",
            duration: "25 min",
            content: [
              "Jesus used reductio ad absurdum (reducing to absurdity) to expose flawed reasoning.",
              "Example: Matthew 12:24-28—Jesus shows the logical impossibility of Satan casting out Satan.",
              "Jesus also used analogies, parables, and rhetorical questions to make truth accessible.",
              "Christ's logic was always in service of truth and love, never mere intellectual victory.",
            ],
            exercises: [
              "Analyze Jesus' logic in Matthew 22:23-33 (the resurrection debate).",
              "What logical techniques does Jesus use in the Sermon on the Mount?",
            ],
          },
          {
            id: "lesson-3",
            title: "Prophetic Logic",
            description: "If-then patterns in Old Testament prophecy",
            duration: "20 min",
            content: [
              "Prophets used conditional logic: 'If you obey, then blessing. If you disobey, then judgment.'",
              "Example: Deuteronomy 28—blessings and curses follow a logical covenant structure.",
              "Prophetic warnings are not arbitrary threats; they're logical consequences of covenant relationship.",
              "Understanding this helps us see God's justice and patience more clearly.",
            ],
            exercises: [
              "Identify if-then structures in Jeremiah 18:7-10.",
              "How does prophetic logic reveal God's character?",
            ],
          },
        ],
      },
      {
        id: "module-2",
        title: "Interpreting Scripture Logically",
        description: "Avoiding interpretive fallacies",
        lessons: [
          {
            id: "lesson-4",
            title: "Context and Coherence",
            description: "Reading Scripture as a unified argument",
            duration: "20 min",
            content: [
              "Scripture interprets Scripture. A verse means what it means in context, not in isolation.",
              "Example: James 2:24 ('justified by works') must be read alongside Romans 3:28 ('justified by faith').",
              "Look for coherence: How does this passage fit the author's argument? The whole Bible's message?",
              "Avoid proof-texting—pulling verses out of context to support pre-existing ideas.",
            ],
            exercises: [
              "Show how Philippians 2:12 ('work out your salvation') fits Paul's overall theology.",
              "Find an example of proof-texting and correct it with proper context.",
            ],
          },
        ],
      },
    ],
  },
  
  emotional: {
    id: "emotional",
    modules: [
      {
        id: "module-1",
        title: "Understanding Emotional Logic",
        description: "How feelings and truth intersect",
        lessons: [
          {
            id: "lesson-1",
            title: "Emotions as Data",
            description: "Feelings reveal what we believe",
            duration: "15 min",
            content: [
              "Emotions are not irrational—they're responses to what we believe (consciously or subconsciously).",
              "If you feel anxious, you may believe you're not safe. If you feel guilty, you may believe you've done wrong.",
              "Emotional logic asks: What belief is generating this feeling? Is that belief true?",
              "This helps us address emotions at their root—by examining and correcting the beliefs behind them.",
            ],
            exercises: [
              "Identify an emotion you feel often. What belief might be causing it?",
              "Journal: When have your emotions led you to truth? When have they misled you?",
            ],
          },
          {
            id: "lesson-2",
            title: "Truth Over Feelings",
            description: "When emotions and reality conflict",
            duration: "20 min",
            content: [
              "Feelings are real, but they're not always reliable indicators of truth.",
              "Example: You may feel unloved, but God's Word says you are loved (Romans 5:8).",
              "Don't dismiss emotions—acknowledge them. But test them against Scripture and reason.",
              "Process: 1. Feel it. 2. Name it. 3. Examine the belief behind it. 4. Replace lies with truth.",
            ],
            exercises: [
              "Practice: 'I feel _____ because I believe _____. The truth is _____.'",
              "How does 2 Corinthians 10:5 relate to emotional logic?",
            ],
          },
          {
            id: "lesson-3",
            title: "Emotional Witness",
            description: "Connecting heart and mind in evangelism",
            duration: "20 min",
            content: [
              "People are rarely argued into the kingdom by logic alone. Emotions matter.",
              "Blend truth with compassion: Show that Christianity addresses both intellectual questions and emotional needs.",
              "Testimony is powerful because it combines logic (evidence) with emotion (personal transformation).",
              "Don't weaponize emotions, but don't ignore them either. Reach the whole person.",
            ],
            exercises: [
              "Write a 2-minute testimony that balances reason and emotion.",
              "How can you validate someone's emotions while still pointing to truth?",
            ],
          },
        ],
      },
      {
        id: "module-2",
        title: "Healing Through Truth",
        description: "Using logic to process pain",
        lessons: [
          {
            id: "lesson-4",
            title: "Cognitive Reframing",
            description: "Replacing lies with truth",
            duration: "25 min",
            content: [
              "Cognitive reframing is the practice of identifying false beliefs and replacing them with true ones.",
              "Example: False belief: 'I'm worthless.' True belief: 'I'm made in God's image and loved by Him.'",
              "This is biblical: 'Be transformed by the renewing of your mind' (Romans 12:2).",
              "Steps: 1. Identify the lie. 2. Challenge it with evidence. 3. Replace it with Scripture. 4. Rehearse the truth.",
            ],
            exercises: [
              "Identify one lie you've believed about yourself. Replace it with Scripture.",
              "How does Philippians 4:8 guide emotional logic?",
            ],
          },
        ],
      },
    ],
  },
};
