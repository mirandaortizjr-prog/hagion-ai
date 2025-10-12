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
  // Curriculum Tracks
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
            duration: "25 min",
            content: [
              "📖 DEFINITION: A fallacy is an error in reasoning that makes an argument invalid or weak. Fallacies are deceptive because they often FEEL persuasive even though they're logically flawed.",
              "Think of fallacies as counterfeit logic—they look like the real thing at first glance, but they lack genuine substance. Just as counterfeit money can fool the untrained eye, fallacies can fool untrained minds.",
              "⚠️ THREE MAIN CATEGORIES:\n1. FORMAL FALLACIES: Errors in logical structure\n2. INFORMAL FALLACIES: Errors in content or relevance\n3. EMOTIONAL FALLACIES: Manipulating feelings instead of presenting evidence",
              "✝️ SPIRITUAL WARFARE CONTEXT: 2 Corinthians 10:5 commands us to 'demolish arguments and every pretension that sets itself up against the knowledge of God.' Fallacies are exactly these kinds of pretensions—arguments that appear strong but crumble under examination.",
              "The serpent in Genesis 3 used fallacies: 'Did God really say...?' (straw man), 'You will not certainly die' (false premise), 'You will be like God' (appeal to pride). Satan is the original fallacy-wielder.",
              "💡 WHY LEARN THIS: Recognizing fallacies serves three purposes:\n1. DEFENSIVE: Protects you from deception\n2. OFFENSIVE: Strengthens your apologetics\n3. PERSONAL: Helps you think more clearly about your own beliefs",
              "🔍 THE DANGER OF UNDETECTED FALLACIES: Bad arguments can lead to false conclusions. If we accept flawed reasoning, we might believe things that aren't true—about God, about ourselves, about morality. This has eternal consequences.",
              "🎯 PRACTICAL SKILL: Learning to spot fallacies is like developing a spiritual immune system. Just as your body fights off infections, your mind can learn to reject logical infections—arguments that sound good but carry poison.",
            ],
            exercises: [
              "BIBLICAL ANALYSIS: Read Genesis 3:1-5. Identify at least three flawed reasoning tactics the serpent uses with Eve. What made them persuasive?",
              "REFLECTION: Can you think of a time when you were persuaded by something that FELT right but later realized was flawed reasoning? What happened?",
              "IMPORTANCE: Write a paragraph explaining why it's crucial for Christians to recognize fallacies. Use at least one Scripture reference.",
              "OBSERVATION: Find an example of fallacious reasoning in online debates, news, or social media. What makes it fallacious? Why might people accept it anyway?",
              "PRAYER: Ask God for discernment to recognize deceptive arguments and wisdom to respond with truth. Pray for protection of your mind.",
              "DISCUSSION: Why do you think fallacies are so persuasive even when they're logically wrong? What makes us vulnerable to them?",
            ],
          },
          {
            id: "lesson-2",
            title: "Ad Hominem Attacks",
            description: "Attacking the person instead of the argument",
            duration: "30 min",
            content: [
              "📖 DEFINITION: 'Ad hominem' is Latin for 'to the person.' This fallacy attacks the character, circumstances, or identity of the person making an argument instead of addressing the argument itself.",
              "🎓 BASIC STRUCTURE:\nPerson A makes claim X.\n'But Person A is [bad quality], so X must be false.'\n\nThe flaw: A claim's truth doesn't depend on who says it. Even a liar can speak truth; even a saint can make mistakes.",
              "⚠️ EXAMPLE 1: 'You can't trust his argument about morality—he's been divorced three times!'\nFLAW: His personal failures don't automatically invalidate his moral reasoning. We must evaluate the argument on its own merits.",
              "⚠️ EXAMPLE 2: 'Of course she believes in God—she was raised Christian. She's just brainwashed.'\nFLAW: The origin of a belief doesn't determine its truth. You could say the same about any belief, including atheism.",
              "✝️ BIBLICAL EXAMPLES:\n• John 1:46 - 'Can anything good come from Nazareth?' (Dismissing Jesus based on His hometown)\n• John 9:34 - 'You were steeped in sin at birth; how dare you lecture us!' (Dismissing the healed blind man)\n• Matthew 11:19 - They called Jesus 'a glutton and drunkard' to undermine His ministry",
              "💡 WHY IT WORKS: Ad hominem attacks are psychologically powerful because:\n1. They trigger emotional responses\n2. They shift focus from difficult truths to comfortable judgments\n3. They appeal to our tendency to judge sources rather than evaluate evidence\n4. They make us feel superior to the person being attacked",
              "🔍 IMPORTANT DISTINCTION: Sometimes character IS relevant:\n• A pathological liar's testimony in court is legitimately questionable\n• A pastor's moral teaching is undermined by gross hypocrisy\n\nBUT: Even then, we must evaluate the argument itself. A hypocritical pastor saying 'love your neighbor' doesn't make that command false.",
              "🎯 HOW TO RESPOND:\n1. Acknowledge: 'I understand your concern about [person's background]'\n2. Redirect: 'But let's focus on the argument itself. Is it true or false?'\n3. Clarify: 'Even if the messenger is flawed, the message might still be true'\n4. Example: 'Let's evaluate the evidence together regardless of who's presenting it'",
              "⚠️ AVOID COUNTER-ATTACKING: Don't respond with your own ad hominem! Stay focused on truth.",
            ],
            exercises: [
              "IDENTIFICATION: Find three examples of ad hominem attacks in online religious or political debates. Screenshot or write them down. Explain why each is fallacious.",
              "PERSONAL APPLICATION: How would you respond if someone dismissed your testimony about Christ because 'you're just emotional' or 'you're brainwashed'? Write a gracious, logical response.",
              "BIBLICAL STUDY: Read John 9:13-34 (healing of blind man). List all the ad hominem attacks used against him. How did he respond?",
              "ROLE PLAY: Practice responding to this: 'I don't care what you say about evolution—you're not even a scientist!' Write your response.",
              "DISTINCTION PRACTICE: When IS character relevant to credibility? When isn't it? Write 2-3 examples of each.",
              "APOLOGETICS PREP: Write a response to: 'Christianity is just what Western colonizers believe. Why should I listen to their religion?'",
              "SELF-EXAMINATION: Have you ever dismissed someone's valid argument because you didn't like them? Confess this to God and commit to evaluating arguments on merit.",
            ],
          },
          {
            id: "lesson-3",
            title: "Straw Man Fallacy",
            description: "Distorting an opponent's position to make it easier to attack",
            duration: "30 min",
            content: [
              "📖 DEFINITION: The straw man fallacy occurs when someone misrepresents an opponent's position (building a 'straw man'), then attacks that distorted version instead of the real argument.",
              "It's called a 'straw man' because it's easier to knock down a straw figure than a real person. It's easier to refute a weak, distorted version of an argument than the actual argument.",
              "🎓 STRUCTURE:\n1. Person A presents position X\n2. Person B misrepresents it as position Y (weaker, more extreme)\n3. Person B attacks position Y\n4. Person B claims to have defeated position X\n\nBut they never actually engaged with the real argument!",
              "⚠️ EXAMPLE 1:\nREAL POSITION: 'I believe Christians should live generously and help the poor.'\nSTRAW MAN: 'Oh, so you think Christians should give away everything and live in poverty?'\nATTACK: 'That's ridiculous and irresponsible!'\n\nFLAW: The real position was never addressed.",
              "⚠️ EXAMPLE 2:\nREAL POSITION: 'Faith is trusting God based on evidence and revelation.'\nSTRAW MAN: 'So you admit faith is believing things without any reason or evidence!'\nATTACK: 'That's blind and foolish!'\n\nFLAW: The straw man version directly contradicts what was actually said.",
              "✝️ BIBLICAL EXAMPLES:\n• Matthew 26:60-61 - False witnesses distorted Jesus' words at His trial\n• Acts 6:13-14 - Stephen was accused of positions he never held\n• Romans 3:8 - Paul addresses those who misrepresent his teaching: 'Why not say—as some slanderously claim that we say—Let us do evil that good may result?'",
              "💡 WHY IT'S USED:\n1. The real position is too strong to refute easily\n2. It makes the opponent look extreme or foolish\n3. It's easier than engaging with nuanced arguments\n4. It rallies supporters against a caricature\n5. Sometimes it's unintentional—people genuinely misunderstand",
              "🔍 HOW TO SPOT IT:\n• Listen for exaggerations: 'So you're saying ALL...', 'You think EVERY...'  \n• Watch for simplifications of complex positions\n• Notice when someone attacks a position you don't actually hold\n• Be alert when your position is paraphrased in extreme language",
              "🎯 HOW TO RESPOND:\n1. CLARIFY: 'That's not quite what I said. Let me clarify...'\n2. RESTATE: 'My actual position is...'\n3. CORRECT: 'I don't believe [straw man]. I believe [real position]'\n4. GENEROUS: Assume good intent when possible: 'I may not have been clear. Let me try again...'\n5. STEEL MAN: Model the opposite—present the strongest version of opposing views",
              "⚠️ AVOID DOING IT YOURSELF: When responding to others, practice 'steel manning'—presenting the strongest, most charitable version of their argument before responding. This builds trust and demonstrates integrity.",
            ],
            exercises: [
              "IDENTIFICATION: 'Atheists say life has no meaning and we're just meaningless meat bags.' What's the straw man? What might a thoughtful atheist actually believe?",
              "CORRECTION PRACTICE: Someone says, 'So you're saying people who don't read the Bible every day aren't real Christians?' How do you graciously correct this straw man?",
              "STEEL MANNING: Take a position you disagree with (e.g., 'wealth is evil' or 'emotions don't matter'). Present the STRONGEST possible version of it before critiquing it.",
              "BIBLICAL ANALYSIS: Read Matthew 26:59-61. How was Jesus' statement about the temple misrepresented? What was His actual meaning (see John 2:19-21)?",
              "REAL-WORLD HUNTING: Find 2-3 examples of straw man arguments in news articles, social media, or debates about Christianity. Quote the straw man and identify the likely real position.",
              "LISTENING PRACTICE: In your next disagreement, practice restating the other person's argument to their satisfaction before responding. Write about the experience.",
              "APOLOGETICS PREP: Write responses to these straw men:\n  • 'Christians think everyone who isn't Christian is going to hell no matter how good they are.'\n  • 'You believe in talking snakes and a man living in a whale. How can I take you seriously?'",
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
            duration: "30 min",
            content: [
              "📖 DEFINITION: Appeal to emotion (argumentum ad passiones) manipulates feelings—fear, pity, anger, joy—instead of presenting logical evidence. It's when someone tries to win an argument by making you feel rather than think.",
              "⚠️ IMPORTANT DISTINCTION: Emotions themselves aren't bad! God gave us feelings. The fallacy occurs when emotion REPLACES reason rather than accompanying it. Truth should engage both heart and mind.",
              "🎓 STRUCTURE:\n'You should believe X because [emotional manipulation]'\n'If you don't accept Y, you should feel [guilty/afraid/ashamed]'\n\nThe missing element: actual evidence or logical reasoning.",
              "TYPES OF EMOTIONAL APPEALS:\n• Appeal to fear: 'If you don't believe this, terrible things will happen!'\n• Appeal to pity: 'I've suffered so much, so you must agree with me'\n• Appeal to anger: 'They're attacking us! We must fight back with this belief!'\n• Appeal to guilt: 'Good people believe this. Don't you want to be good?'",
              "⚠️ EXAMPLE 1 (Appeal to Fear):\n'How can you believe in a God who allows children to suffer? Imagine the pain of a dying child!'\n\nFLAW: The emotional horror of suffering doesn't address whether God exists or whether He has reasons we don't understand. The problem of evil requires rational engagement, not just emotional reaction.",
              "⚠️ EXAMPLE 2 (Appeal to Pity):\n'I've been through so much pain. You can't tell me there's a loving God!'\n\nFLAW: Personal suffering, while real and deserving compassion, doesn't logically disprove God's existence or love. Many have suffered deeply and found God in their pain.",
              "⚠️ EXAMPLE 3 (Appeal to Guilt):\n'If you really loved the poor, you'd support this policy.'\n\nFLAW: Loving the poor is good, but whether a specific policy helps them requires evidence and reasoning, not just moral posturing.",
              "💡 WHY IT'S POWERFUL:\n• Emotions are real and immediate—they feel more urgent than abstract reasoning\n• We're wired to respond to emotional cues (survival mechanism)\n• Emotions can short-circuit critical thinking\n• It's easier to feel than to think through complex issues\n• We don't want to appear cold or heartless",
              "✝️ BIBLICAL BALANCE:\nScripture engages BOTH emotion and reason:\n• Jesus wept (emotion) but also taught with logic\n• Paul reasoned in synagogues (Acts 17:2) and also expressed deep feeling (Romans 9:1-3)\n• Proverbs balances 'The fear of the LORD' (emotion) with 'knowledge' (reason)",
              "🎯 HOW TO RESPOND:\n1. ACKNOWLEDGE: 'I understand why you feel that way. That's a valid emotion.'\n2. VALIDATE: 'Your feelings are real and important.'\n3. DISTINGUISH: 'But let's also look at the evidence and reasoning together.'\n4. GENTLE REDIRECT: 'What we feel is important, but truth isn't determined by feelings alone.'\n5. INTEGRATE: 'Let's engage both our hearts and minds on this.'",
              "🔍 SELF-CHECK: Ask yourself:\n• Am I accepting this because it makes me feel good/bad?\n• Would I still believe this if I felt differently?\n• What's the actual evidence, apart from emotion?\n• Am I thinking clearly or just reacting emotionally?",
            ],
            exercises: [
              "IDENTIFICATION: Find three examples of emotional appeals in advertisements, political speeches, or religious discussions. What emotion is being targeted? What's missing logically?",
              "DISTINCTION PRACTICE: Write the difference between: (1) A legitimate emotional response to truth, and (2) An emotional manipulation instead of truth.",
              "RESPONSE DRILL: How would you respond to: 'How dare you tell me I'm a sinner! That's hurtful and judgmental!' (Acknowledge emotion + present truth)",
              "BIBLICAL STUDY: Read Acts 26:24-29 (Paul before Agrippa). How does Paul balance emotion and reason in his defense? What emotions does he appeal to? What evidence does he present?",
              "APOLOGETICS PRACTICE: Respond to: 'A good God wouldn't send people to hell. That's cruel!' (Engage both the emotional and logical dimensions)",
              "SELF-EXAMINATION: Identify a belief you hold primarily because it feels right rather than because you've examined evidence. Commit to investigating it more deeply.",
              "INTEGRATION EXERCISE: Take a Christian truth (e.g., 'God loves you'). Write a presentation that engages BOTH emotion (personal testimony, moving illustration) AND reason (evidence, logic, Scripture).",
            ],
          },
          {
            id: "lesson-5",
            title: "Appeal to Popularity",
            description: "Believing something because many people do",
            duration: "25 min",
            content: [
              "📖 DEFINITION: Appeal to popularity (argumentum ad populum—'to the people') claims something is true simply because many people believe it. The logic is: 'Everyone believes X, therefore X must be true.'",
              "🎓 STRUCTURE:\n'Most people believe X.'\n'Therefore, X is true.'\n\nThe flaw: Truth is not determined by majority vote. Popularity doesn't equal accuracy.",
              "⚠️ EXAMPLES:\n• 'Most scientists don't believe in God, so God probably doesn't exist.'\n• 'Everyone knows you can't trust the Bible.'\n• 'The majority of people accept evolution, so it must be true.'\n• 'Most modern people don't believe in absolute truth anymore, so it must not exist.'",
              "IMPORTANT DISTINCTION:\nPopularity ≠ Truth\nBut popularity CAN be evidence worth considering:\n• Expert consensus in a field (not proof, but worth investigating)\n• Long-held beliefs across cultures (may point to truth, but must be examined)\n• Common human intuitions (like 'murder is wrong') may reflect moral reality\n\nThe key: Don't STOP at popularity. Investigate the reasons behind the belief.",
              "✝️ BIBLICAL WARNINGS AGAINST MAJORITY:\n• Matthew 7:13-14: 'Enter through the narrow gate... only a few find it.' Jesus explicitly says truth is often with the minority.\n• Exodus 23:2: 'Do not follow the crowd in doing wrong.'\n• Romans 12:2: 'Do not conform to the pattern of this world.'\n• 1 Kings 18: Elijah alone against 450 prophets of Baal—truth doesn't need numbers.",
              "💡 HISTORICAL EXAMPLES:\n• Once, everyone 'knew' the earth was flat (it isn't)\n• Once, everyone 'knew' the sun orbited the earth (it doesn't)\n• Once, everyone 'knew' slavery was acceptable (it wasn't)\n• In Jesus' time, everyone 'knew' the Messiah would be a political king (they were wrong)\n\nPopular opinion has been spectacularly wrong throughout history.",
              "🔍 WHY IT'S PERSUASIVE:\n• We want to belong and fit in (social pressure)\n• We assume 'all those people can't be wrong'\n• It's easier to accept common views than to think independently\n• Going against the majority feels uncomfortable or even dangerous\n• We fear being seen as weird, ignorant, or arrogant",
              "🎯 HOW TO RESPOND:\n1. ACKNOWLEDGE: 'It's true that many people believe that.'\n2. QUESTION: 'But has the majority ever been wrong before?'\n3. REDIRECT: 'Let's look at the evidence, not just the popularity.'\n4. EXAMPLE: 'Once everyone believed the earth was flat. Numbers don't determine truth.'\n5. SCRIPTURE: 'Jesus said the path to truth is narrow and few find it (Matthew 7:14).'",
              "⚠️ COUNTER-FALLACY WARNING: Don't commit the opposite error—assuming truth is ALWAYS with the minority. Sometimes the majority is right! The point is to evaluate evidence, not count votes.",
            ],
            exercises: [
              "HISTORICAL RESEARCH: Find three examples from history where popular opinion was wrong. What changed people's minds?",
              "CURRENT CULTURE: Identify three beliefs that are popular today but may not be true. What evidence would you examine to evaluate them?",
              "RESPONSE PRACTICE: Write a gracious response to: 'How can billions of people be wrong about [insert popular belief]?'",
              "BIBLICAL STUDY: Read 1 Kings 18:16-40 (Elijah vs. prophets of Baal). How does this story illustrate that truth isn't determined by numbers?",
              "PEER PRESSURE: Have you ever gone along with a popular belief because you didn't want to stand out? What was it? What helped you (or would help you) stand for truth?",
              "APOLOGETICS: How would you respond to: 'Most people in educated countries don't believe in miracles anymore, so miracles probably don't happen.'",
              "WISDOM: When SHOULD popular opinion be taken seriously? When should it be questioned? Write principles for discernment.",
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
            duration: "30 min",
            content: [
              "📖 DEFINITION: 'Apologetics' comes from the Greek word 'apologia' (ἀπολογία), meaning 'a defense' or 'a reasoned argument.' In ancient courts, an apologia was a speech given to defend oneself against accusations.",
              "The Apostle Peter commands: 'Always be prepared to give an answer (apologia) to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect' (1 Peter 3:15).",
              "💡 WHAT APOLOGETICS IS:\n• Providing reasons and evidence for Christian faith\n• Removing intellectual obstacles that keep people from Christ\n• Answering questions and objections thoughtfully\n• Demonstrating that faith is rational and evidence-based\n• Building bridges between minds and hearts",
              "⚠️ WHAT APOLOGETICS IS NOT:\n• Arguing to win or humiliate opponents\n• Proof that removes all need for faith\n• A substitute for the Holy Spirit's work\n• Only for scholars and intellectuals\n• A guarantee that people will convert",
              "✝️ BIBLICAL FOUNDATION:\n• Acts 17:2 - Paul 'reasoned with them from the Scriptures'\n• Acts 17:17 - Paul 'reasoned in the synagogue... and in the marketplace'\n• Acts 18:4 - 'Every Sabbath he reasoned in the synagogue'\n• 2 Corinthians 10:5 - 'We demolish arguments... that set themselves up against the knowledge of God'\n• Jude 3 - 'Contend for the faith'",
              "🎯 WHY APOLOGETICS MATTERS:\n1. God commands it (1 Peter 3:15)\n2. People have real questions that deserve real answers\n3. Faith strengthens when grounded in reason and evidence\n4. It equips believers to stand firm in a skeptical culture\n5. It honors God's gift of reason\n6. It can remove barriers preventing people from considering Christ",
              "💡 THE BALANCE: Apologetics combines:\n• REASON + FAITH (not faith alone, not reason alone)\n• TRUTH + LOVE (speak truth, but with gentleness)\n• EVIDENCE + SPIRIT (present facts, trust God to work)\n• MIND + HEART (engage intellect, touch emotion)",
              "🔍 APOLOGETICS IN ACTION:\n• Answering 'If God exists, why is there evil?'\n• Demonstrating historical reliability of Scripture\n• Explaining the resurrection's evidence\n• Addressing 'All religions lead to God'\n• Showing faith is rational, not blind",
            ],
            exercises: [
              "BIBLICAL STUDY: Read 1 Peter 3:15-16 carefully. Why does Peter emphasize 'gentleness and respect' alongside giving reasons? How does this shape apologetics?",
              "PERSONAL INVENTORY: List 3-5 questions about Christianity you've struggled to answer. These will be your starting points for growth.",
              "REFLECTION: Why does God command us to give reasons for our faith if the Holy Spirit does the converting? Write your thoughts.",
              "APOLOGETICS ENCOUNTER: Think of a conversation where you wish you had better answers. What would you do differently now?",
              "PRAYER: Ask God for wisdom, knowledge, and love as you study apologetics. Pray that He'll use your learning to reach others.",
              "TESTIMONY: Have you ever had a question answered that strengthened your faith? Share that story with someone this week.",
            ],
          },
          {
            id: "lesson-2",
            title: "The Cosmological Argument",
            description: "Why must there be a First Cause?",
            duration: "35 min",
            content: [
              "📖 THE ARGUMENT: The Cosmological Argument reasons from the existence of the cosmos (universe) to the existence of God as its cause. If the universe exists, something must have caused it to exist.",
              "🎓 CLASSIC FORMULATION (Kalam Cosmological Argument):\n1. Everything that begins to exist has a cause\n2. The universe began to exist\n3. Therefore, the universe has a cause",
              "💡 PREMISE 1: Everything that begins to exist has a cause.\n\nThis is intuitive and confirmed by all experience. We never see things pop into existence uncaused. If you see a new building, you know someone built it. If you find a watch on the beach, you know someone made it.",
              "Can something come from nothing? No. 'Nothing' has no properties, no potential, no power. From nothing, nothing comes (ex nihilo nihil fit).",
              "💡 PREMISE 2: The universe began to exist.\n\nSCIENTIFIC EVIDENCE:\n• The Big Bang: The universe exploded into existence ~13.8 billion years ago from a singularity\n• Second Law of Thermodynamics: Usable energy is running down. If the universe were eternal, it would have run out\n• Expansion of the universe: Edwin Hubble showed the universe is expanding, meaning it had a starting point",
              "PHILOSOPHICAL EVIDENCE:\n• An infinite past is logically impossible (you can't traverse an infinite number of moments)\n• If the past were infinite, we'd never arrive at today",
              "✝️ WHAT MUST THIS CAUSE BE?\nSince the cause created:\n• Time → The cause must be TIMELESS (eternal)\n• Space → The cause must be SPACELESS\n• Matter → The cause must be IMMATERIAL\n• The entire universe → The cause must be INCREDIBLY POWERFUL\n• A fine-tuned, ordered cosmos → The cause must be INTELLIGENT\n• Moral beings → The cause must be PERSONAL (capable of choice)",
              "These qualities match the God of the Bible perfectly!",
              "🔍 COMMON OBJECTION: 'Who created God?'\n\nRESPONSE: The argument says 'Everything that BEGINS to exist has a cause.' God didn't begin—He's eternal. He's the uncaused First Cause. To ask 'Who created God?' misunderstands what God is.",
              "Infinite regress is impossible. There must be a starting point—an Uncaused Cause. That's God.",
              "🎯 APOLOGETIC POWER: This argument shows:\n• Faith in God is reasonable\n• Science and faith are compatible\n• Atheists must explain how everything came from nothing\n• The universe pointing to a Creator matches Genesis 1:1",
            ],
            exercises: [
              "LOGICAL ANALYSIS: Explain why something cannot create itself. Why is that logically impossible?",
              "SCIENTIFIC RESEARCH: Research the Big Bang theory. Write a one-paragraph summary of what happened and why it supports Premise 2.",
              "RESPONSE DRILL: How would you respond to: 'Who created God? Your argument fails!' Write a clear, gracious answer.",
              "BIBLICAL CONNECTION: Read Genesis 1:1, John 1:1-3, and Colossians 1:16-17. How do these passages affirm God as the First Cause?",
              "OBJECTION HANDLING: Respond to: 'Maybe the universe created itself.' Why is this impossible?",
              "PRACTICAL APPLICATION: Share the Cosmological Argument with a friend or family member. How did they respond? What questions arose?",
              "DEEPER STUDY: Research 'Quantum mechanics and causality.' Some argue quantum events are uncaused. Investigate whether this defeats the argument.",
            ],
          },
          {
            id: "lesson-3",
            title: "The Moral Argument",
            description: "Objective morality points to a Moral Lawgiver",
            duration: "35 min",
            content: [
              "📖 THE ARGUMENT: If objective moral values and duties exist, then God exists. Objective moral values DO exist. Therefore, God exists.",
              "🎓 FORMAL STRUCTURE:\n1. If God does not exist, objective moral values and duties do not exist\n2. Objective moral values and duties DO exist\n3. Therefore, God exists",
              "💡 KEY TERMS:\n• OBJECTIVE = True independent of human opinion (like '2+2=4')\n• SUBJECTIVE = True based on opinion or culture (like 'pizza tastes good')\n• MORAL VALUES = What is good/evil\n• MORAL DUTIES = What we ought/ought not do",
              "🔍 TESTING OBJECTIVITY: Ask yourself: Is torturing babies for fun objectively wrong, or just culturally unpopular?\n\nMost people immediately feel it's OBJECTIVELY wrong—not just 'wrong for me' or 'wrong in our culture,' but wrong everywhere, always, for everyone.",
              "⚠️ WITHOUT GOD, morality becomes:\n• Personal preference ('Murder is wrong for ME')\n• Social convention ('Our culture says it's wrong')\n• Evolutionary adaptation ('It hurt survival')\n• Legal decree ('The law says don't')\n\nNone of these make something OBJECTIVELY wrong.",
              "✝️ WITH GOD, morality is:\n• Grounded in His eternal, unchanging nature\n• Not arbitrary (God can't just decide 'murder is good')\n• Absolute and universal\n• Binding on all people everywhere\n\nGod doesn't just command morality—He IS the standard of goodness.",
              "💡 C.S. LEWIS'S VERSION: 'A man does not call a line crooked unless he has some idea of a straight line.' We couldn't recognize evil unless we knew good. That standard of goodness points to God.",
              "🎯 POWERFUL QUESTIONS:\n• 'If there's no God, why is the Holocaust objectively wrong?'\n• 'Can you live as though morality is just opinion?'\n• 'Where do human rights come from if we're just evolved animals?'\n• 'Why should I be moral if there's no ultimate justice?'",
              "COMMON OBJECTION #1: 'I don't need God to be good!'\n\nRESPONSE: 'You're right—you don't need God to BE good (do good acts). God's common grace enables that. But you DO need God for goodness to be OBJECTIVELY good. Without Him, good is just your opinion.'",
              "COMMON OBJECTION #2: 'Morality evolved to help us survive.'\n\nRESPONSE: 'Evolution explains why we FEEL certain ways, but not why we SHOULD obey those feelings. If rape helped survival, would that make it right? No! So our moral knowledge comes from somewhere beyond evolution.'",
              "COMMON OBJECTION #3: 'The Bible has immoral commands!'\n\nRESPONSE: 'To call something in the Bible \"immoral,\" you are appealing to a standard of morality outside yourself. Where did that standard come from? It points to God. Also, let us examine those passages in context...'",
            ],
            exercises: [
              "OBJECTIVITY TEST: List 5 moral truths you believe are objectively true (not just opinion). Explain WHY they're objective without appealing to God. Can you do it?",
              "PHILOSOPHY QUESTION: If there is no God, why can't morality be based on human opinion alone? Write a paragraph explaining the problem.",
              "RESPONSE PRACTICE: Write a full response to: 'I don't need God to be good—I'm a good person!'",
              "BIBLICAL FOUNDATION: Read Romans 2:14-15. How does Paul explain moral knowledge in non-believers?",
              "CULTURAL COMPARISON: Research moral codes from different cultures. What do they have in common? What does that suggest?",
              "APOLOGETICS DIALOGUE: Role-play this conversation: 'Morality evolved to help the species survive. We don't need God.' How would you respond?",
              "DEEPER REFLECTION: If you truly believed morality was just opinion, how would that change your behavior? Your outrage at injustice?",
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
            duration: "40 min",
            content: [
              "📖 THE CORNERSTONE: 1 Corinthians 15:14 - 'If Christ has not been raised, our preaching is useless and so is your faith.' The resurrection is THE foundational claim of Christianity.",
              "💡 THE MINIMAL FACTS APPROACH: Scholars (even skeptical ones) accept these core facts about Jesus' death and resurrection:",
              "FACT #1: JESUS DIED BY CRUCIFIXION\n• Multiple independent sources (Roman, Jewish, Christian)\n• Crucifixion was Rome's method—brutal and lethal\n• Even skeptics accept this historical fact\n• No serious scholar doubts Jesus died on the cross",
              "FACT #2: THE DISCIPLES GENUINELY BELIEVED THEY SAW JESUS ALIVE\n• They didn't just claim it—they truly believed it\n• They endured persecution, torture, death\n• People don't die for what they KNOW is a lie\n• Liars make poor martyrs\n• 1 Cor 15:3-8 lists witnesses, some still alive when Paul wrote (fact-checking invited!)",
              "FACT #3: SKEPTICS CONVERTED AFTER SEEING JESUS\n• Paul: Persecutor of Christians → Apostle willing to die for Christ\n• James: Jesus' skeptical brother → Leader of Jerusalem church, martyr\n• These weren't gullible followers—they were HOSTILE witnesses who changed completely",
              "FACT #4: THE TOMB WAS EMPTY\n• Jewish and Roman authorities never produced the body\n• If the body was there, they'd have displayed it to crush Christianity\n• Earliest Christian creed (1 Cor 15:3-4) includes 'he was buried... he was raised'\n• Even Jewish sources admit the tomb was empty (they just disputed WHY)",
              "🔍 ALTERNATIVE THEORIES (and why they fail):\n\n1. HALLUCINATION: 'The disciples hallucinated.'\n• Hallucinations are individual, not group experiences\n• 500+ people saw Jesus at once (1 Cor 15:6)\n• Skeptics like Paul had hallucinations?\n• Doesn't explain the empty tomb\n\n2. CONSPIRACY: 'The disciples stole the body.'\n• Disciples were cowards who fled at arrest—suddenly brave enough to fight Roman guards?\n• People don't die for lies they invented\n• Why would James and Paul join a conspiracy they knew was false?\n\n3. SWOON THEORY: 'Jesus didn't really die; He just passed out.'\n• Roman executioners were experts at killing\n• Even if He survived, He'd be too weak to move the stone or convince anyone He'd conquered death\n• Medical analysis confirms crucifixion was fatal\n\n4. WRONG TOMB: 'They went to the wrong tomb.'\n• Joseph of Arimathea owned it—hard to forget your own tomb\n• Authorities could easily correct the error\n• Doesn't explain appearances to 500+",
              "✅ THE BEST EXPLANATION: Jesus actually rose from the dead. This explains:\n✓ The empty tomb\n✓ The appearances to individuals and groups\n✓ The transformation of the disciples\n✓ The conversion of skeptics\n✓ The birth of Christianity\n✓ The willingness to die rather than recant",
              "✝️ IMPLICATIONS: If Jesus rose from the dead:\n• His claims about being God are vindicated\n• Death is defeated\n• There is life after death\n• Christianity is true\n• We will be judged\n• There is hope beyond the grave",
              "🎯 APOLOGETIC POWER: The resurrection is the most historically defensible miracle claim in any religion. No other faith has this level of historical documentation for its central miracle.",
            ],
            exercises: [
              "MINIMAL FACTS: Explain each of the four minimal facts to a friend. Can they dispute any of them historically?",
              "THEORY TESTING: Pick one alternative theory (hallucination, conspiracy, swoon, wrong tomb). Research it in depth. Write why it fails to account for all four facts.",
              "MARTYRDOM QUESTION: Why would the disciples die for a lie if they made up the resurrection? What does this prove?",
              "BIBLICAL STUDY: Read 1 Corinthians 15:3-8. List all the witnesses Paul mentions. Why does he invite fact-checking?",
              "HISTORICAL INVESTIGATION: Research the Shroud of Turin, the James Ossuary, or other archaeological findings related to Jesus. Do they support or undermine the resurrection account?",
              "PERSONAL IMPACT: If you absolutely knew Jesus rose from the dead, how would your life change TODAY?",
              "SHARE THE GOSPEL: Using the historical evidence for the resurrection, share the gospel with someone this week. How did they respond?",
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
  
  // Teaching Paths
  "apologetics-path": {
    id: "apologetics-path",
    modules: [
      {
        id: "intro-apologetics",
        title: "Introduction to Apologetics",
        description: "Understanding the role of apologetics in defending the faith",
        lessons: [
          {
            id: "what-is-apologetics",
            title: "What is Apologetics?",
            description: "Learn the foundational purpose and methods",
            duration: "15 min",
            content: [
              "Apologetics comes from the Greek word 'apologia,' meaning 'to give a defense.' It's the practice of defending Christian beliefs through reasoned arguments and evidence.",
              "1 Peter 3:15 calls us to 'always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.'",
              "Effective apologetics combines logic, evidence, and compassion to help others understand the truth of Christianity."
            ],
            exercises: [
              "Write down three questions people have asked you about your faith",
              "Practice explaining the gospel using logical reasoning",
              "Study 1 Peter 3:15 and memorize it"
            ]
          }
        ]
      }
    ]
  },
  "witnessing-path": {
    id: "witnessing-path",
    modules: [
      {
        id: "intro-witnessing",
        title: "Introduction to Witnessing",
        description: "Learning to share your faith with wisdom and grace",
        lessons: [
          {
            id: "emotional-discernment",
            title: "Emotional Discernment in Witnessing",
            description: "Understanding how to read and respond to emotions",
            duration: "20 min",
            content: [
              "Effective witnessing requires both truth and compassion. We must discern the emotional state of those we're speaking with.",
              "Jesus demonstrated perfect emotional intelligence - comforting the broken-hearted while challenging the self-righteous.",
              "Learn to ask questions, listen deeply, and tailor your message to where someone is in their spiritual journey."
            ],
            exercises: [
              "Practice active listening with someone this week",
              "Identify three emotional barriers people have to faith",
              "Role-play a witnessing conversation focusing on empathy"
            ]
          }
        ]
      }
    ]
  },
  "logic-path": {
    id: "logic-path",
    modules: [
      {
        id: "intro-logic",
        title: "Introduction to Logic",
        description: "Building the scaffolding of truth through logical reasoning",
        lessons: [
          {
            id: "basic-logic-principles",
            title: "Basic Logic Principles",
            description: "Understanding the fundamental laws of logic",
            duration: "25 min",
            content: [
              "Logic is the study of correct reasoning. It helps us distinguish between valid and invalid arguments.",
              "The three fundamental laws of logic are: (1) Law of Identity (A is A), (2) Law of Non-Contradiction (A cannot be both B and not B), (3) Law of Excluded Middle (A is either B or not B).",
              "These principles are foundational to all rational thought and reflect the nature of God, who is Logos - the divine reason."
            ],
            exercises: [
              "Identify examples of each law of logic in daily life",
              "Find a flawed argument and explain which logical principle it violates",
              "Write a paragraph explaining how logic reflects God's nature"
            ]
          }
        ]
      }
    ]
  },
  "scriptural-path": {
    id: "scriptural-path",
    modules: [
      {
        id: "intro-scripture",
        title: "Introduction to Scripture",
        description: "Studying the structure and rhetoric of biblical texts",
        lessons: [
          {
            id: "bible-logic-structure",
            title: "Logic and Structure in the Bible",
            description: "Discovering how Scripture uses logical reasoning",
            duration: "30 min",
            content: [
              "The Bible is not just a collection of stories - it contains sophisticated logical arguments and rhetorical structures.",
              "Paul's epistles, especially Romans, use formal logical argumentation. Jesus often used syllogisms, analogies, and reductio ad absurdum in His teaching.",
              "Understanding the logical structure of Scripture helps us interpret it correctly and apply it faithfully."
            ],
            exercises: [
              "Read Romans 5:12-21 and outline Paul's logical argument",
              "Identify a parable where Jesus uses logical reasoning",
              "Compare the structure of different biblical genres (narrative, epistle, prophecy)"
            ]
          }
        ]
      }
    ]
  },
  "ceremonial-path": {
    id: "ceremonial-path",
    modules: [
      {
        id: "intro-ceremonial",
        title: "Introduction to Ceremonial Logic",
        description: "Learning to ritualize truth through prayer, poetry, and proclamation",
        lessons: [
          {
            id: "ritualizing-truth",
            title: "Ritualizing Truth",
            description: "How ceremony embodies logical and spiritual truth",
            duration: "20 min",
            content: [
              "Truth is not just intellectual - it must be embodied through ritual, prayer, and sacred practice.",
              "The liturgy, sacraments, and Christian calendar all ritualize theological truths, making abstract concepts tangible.",
              "When we combine logic with ceremony, we engage both mind and heart in worship."
            ],
            exercises: [
              "Write a prayer that incorporates a logical truth about God",
              "Create a personal ritual that reminds you of a biblical truth",
              "Study the structure of the Lord's Prayer and identify its logical progression"
            ]
          }
        ]
      }
    ]
  }
};
