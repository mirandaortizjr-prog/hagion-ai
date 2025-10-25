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

type Language = 'en' | 'es';

export const getCurriculumData = (language: Language = 'en'): Record<string, Curriculum> => {
  if (language === 'es') {
    return curriculumDataEs;
  }
  return curriculumDataEn;
};

const curriculumDataEn: Record<string, Curriculum> = {
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
        id: "foundations-apologetics",
        title: "Foundations of Christian Apologetics",
        description: "Understanding the biblical basis and purpose of defending the faith",
        lessons: [
          {
            id: "what-is-apologetics",
            title: "What is Apologetics?",
            description: "Learn the foundational purpose and methods",
            duration: "20 min",
            content: [
              "📖 BIBLICAL FOUNDATION: The word 'apologetics' comes from the Greek 'apologia' (ἀπολογία), meaning 'to give a defense' or 'to speak in defense.' In 1 Peter 3:15, we're commanded: 'Always be prepared to give an answer (apologia) to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect.'",
              "Apologetics is not about being apologetic or defensive—it's about confidently and lovingly presenting the rational foundations of Christian faith. It combines three essential elements: LOGIC (sound reasoning), EVIDENCE (historical and scientific facts), and LOVE (compassionate presentation).",
              "💡 KEY INSIGHT: Apologetics serves multiple purposes: (1) Removing intellectual obstacles that prevent people from considering Christ, (2) Strengthening the faith of believers through reasoned understanding, (3) Defending Christianity against false teachings and objections.",
              "Throughout Scripture, we see apologetics in action. Paul 'reasoned' with people in synagogues (Acts 17:2), Jesus used logical arguments to refute the Pharisees (Matthew 22:41-46), and the early church fathers wrote extensive defenses of Christianity against pagan critics.",
              "🎯 THREE APPROACHES: (1) Classical Apologetics - Uses philosophical arguments like the cosmological and teleological arguments for God's existence. (2) Evidential Apologetics - Focuses on historical evidence, especially for the resurrection. (3) Presuppositional Apologetics - Examines the foundational assumptions necessary for rational thought itself."
            ],
            exercises: [
              "MEMORIZATION: Write out 1 Peter 3:15-16 and memorize it this week",
              "REFLECTION: List three intellectual questions or objections to Christianity you've encountered. How might apologetics address each?",
              "PRACTICE: Choose one approach (Classical, Evidential, or Presuppositional) and research one argument from that tradition"
            ]
          },
          {
            id: "cosmological-argument",
            title: "The Cosmological Argument",
            description: "Understanding arguments for God as the First Cause",
            duration: "30 min",
            content: [
              "📖 FOUNDATION: The Cosmological Argument states that everything that begins to exist has a cause, the universe began to exist, therefore the universe has a cause. This cause must be uncaused, eternal, and outside of time and space—attributes that match the biblical God.",
              "Thomas Aquinas famously formulated five ways to prove God's existence, with the cosmological argument being central. Modern versions, like the Kalam Cosmological Argument developed by William Lane Craig, incorporate contemporary science including Big Bang cosmology.",
              "💡 THE KALAM ARGUMENT: (1) Whatever begins to exist has a cause. (2) The universe began to exist. (3) Therefore, the universe has a cause. Scientific evidence from thermodynamics and cosmic expansion supports premise #2. The cause must be timeless, spaceless, immaterial, powerful, and personal.",
              "The Big Bang theory, far from disproving God, actually provides strong evidence for a cosmic beginning. Even atheist scientists like Stephen Hawking acknowledged that 'almost everyone now believes that the universe began with a Big Bang singularity.' This beginning demands an explanation.",
              "🎯 ANSWERING OBJECTIONS: Common objection: 'Who created God?' Response: God, by definition, is uncaused and eternal. Only things that BEGIN to exist need a cause. God never began—He is the eternal 'I AM' (Exodus 3:14). The question contains a category error, like asking 'What does blue taste like?'"
            ],
            exercises: [
              "STUDY: Read Genesis 1:1 and John 1:1-3. How do these passages relate to the cosmological argument?",
              "LOGIC PRACTICE: Write out the Kalam argument in syllogistic form and explain each premise",
              "APPLICATION: Watch a debate on the cosmological argument and identify the key objections raised"
            ]
          },
          {
            id: "design-argument",
            title: "The Teleological Argument (Design)",
            description: "Evidence of purpose and design in creation",
            duration: "30 min",
            content: [
              "📖 BIBLICAL FOUNDATION: Romans 1:20 states, 'Since the creation of the world God's invisible qualities—his eternal power and divine nature—have been clearly seen, being understood from what has been made.' The design argument reasons from the apparent design in nature to an intelligent Designer.",
              "The classic watchmaker analogy: If you found a watch on a beach, you wouldn't assume it formed by random wave action. The complexity and purpose evident in its mechanism point to an intelligent watchmaker. How much more does the far greater complexity of life point to a Creator?",
              "💡 MODERN DESIGN ARGUMENTS: (1) Fine-Tuning of Universal Constants - The physical constants of the universe are calibrated to within impossibly narrow margins for life to exist. If gravity were different by 1 part in 10^40, no stars or planets could form. (2) Information in DNA - DNA contains specified, complex information that functions like computer code. Information always has an intelligent source.",
              "The human eye is often cited as an example of 'irreducible complexity'—a system that requires all parts working together. Remove any component (lens, retina, optic nerve, etc.) and the system fails. This challenges the idea of gradual, step-by-step evolution with no guidance.",
              "🎯 ANSWERING OBJECTIONS: 'Evolution explains design.' Response: Evolution describes a mechanism but doesn't eliminate the need for a Designer who established the laws that govern evolution. Even if God used evolutionary processes, that doesn't negate His role as Creator and Sustainer."
            ],
            exercises: [
              "OBSERVATION: Examine your own hand—bones, muscles, nerves, skin working in harmony. Write down 5 aspects that demonstrate design",
              "RESEARCH: Look up the fine-tuning of one universal constant (e.g., cosmological constant, strong nuclear force) and explain its significance",
              "BIBLICAL STUDY: Read Psalm 19:1-4 and Job 12:7-10. How do these passages present the design argument?"
            ]
          }
        ]
      },
      {
        id: "resurrection-evidence",
        title: "Evidence for the Resurrection",
        description: "Historical arguments for Christ's resurrection",
        lessons: [
          {
            id: "resurrection-facts",
            title: "Minimal Facts Approach",
            description: "Core historical facts virtually all scholars accept",
            duration: "35 min",
            content: [
              "📖 BIBLICAL FOUNDATION: 1 Corinthians 15:3-8 contains an early Christian creed stating that Christ died, was buried, rose on the third day, and appeared to many witnesses. Paul wrote this around 55 AD, within 20-25 years of the events, and the creed itself dates to within just 2-5 years of the crucifixion.",
              "The 'Minimal Facts' approach, developed by Gary Habermas, focuses on facts that are so well-established that virtually all critical scholars—including skeptics—accept them. This creates common ground for discussion regardless of someone's presuppositions.",
              "💡 THE FIVE MINIMAL FACTS: (1) Jesus died by crucifixion. (2) Jesus' disciples believed He rose and appeared to them. (3) The conversion of the church persecutor Saul/Paul. (4) The conversion of the skeptic James, Jesus' brother. (5) Jesus' tomb was found empty. These facts must be explained by any theory about what happened.",
              "Alternative theories consistently fail to account for all the facts. The 'swoon theory' (Jesus didn't really die) fails because Roman crucifixion was extremely effective, and a barely-alive Jesus couldn't have convinced anyone He conquered death. The 'hallucination theory' fails because hallucinations are individual experiences, yet Jesus appeared to groups. Plus, hallucinations don't leave empty tombs.",
              "🎯 THE RESURRECTION BEST EXPLAINS THE FACTS: The 'legend theory' fails because legends take generations to develop, but here we have testimony from eyewitnesses still alive when accounts were written. The 'conspiracy theory' fails because people don't willingly die for what they know is a lie—yet the disciples faced martyrdom proclaiming the resurrection. Only the actual resurrection adequately explains all the historical data."
            ],
            exercises: [
              "MEMORIZATION: Memorize the 1 Corinthians 15:3-8 creed. Notice how early and how close to the events this testimony is",
              "CRITICAL THINKING: Choose one alternative theory (swoon, hallucination, conspiracy, or legend) and write out why it fails to explain the facts",
              "HISTORICAL ANALYSIS: Research the martyrdom of at least two apostles. What does their willingness to die tell us about their certainty?"
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
        id: "foundations-witnessing",
        title: "Foundations of Effective Witnessing",
        description: "Biblical principles for sharing your faith with wisdom and love",
        lessons: [
          {
            id: "jesus-model-witnessing",
            title: "Jesus' Model of Witnessing",
            description: "Learning from how Christ shared truth",
            duration: "25 min",
            content: [
              "📖 BIBLICAL FOUNDATION: Jesus was the master witness who perfectly adapted His approach to each person. With Nicodemus (John 3), a religious leader, He discussed theological concepts. With the Samaritan woman (John 4), a social outcast, He met her practical needs and revealed Himself gradually. With the rich young ruler (Mark 10), He challenged his idolatry of wealth.",
              "💡 KEY PRINCIPLE: Jesus always started where people were, not where He wished they were. He asked questions to reveal hearts ('Who do you say that I am?'), told stories that convicted without condemning (parables), and demonstrated the Father's love through actions before expecting faith.",
              "MEETING EMOTIONAL NEEDS: Before addressing intellectual objections, Jesus often met emotional and relational needs. The woman caught in adultery (John 8) needed acceptance before correction. Zacchaeus (Luke 19) needed to be seen and valued. Thomas (John 20) needed his doubts taken seriously, not dismissed.",
              "🎯 PRACTICAL APPLICATION: Effective witnessing requires: (1) LISTEN MORE than you speak—understand before being understood. (2) ASK QUESTIONS rather than making assertions—help people discover truth. (3) TELL YOUR STORY—personal testimony is powerful and hard to argue against. (4) SHOW LOVE IN ACTION—actions validate words.",
              "Remember Jesus' command in Matthew 28:19-20: 'Go and make disciples'—not just converts. Witnessing isn't just about getting someone to pray a prayer; it's about walking with them in their journey toward Christ and discipleship."
            ],
            exercises: [
              "STUDY: Read John 4:1-42 (Jesus and the Samaritan woman). List 5 techniques Jesus used in this witnessing encounter",
              "REFLECTION: Think of someone you want to witness to. What are their emotional needs? Their intellectual questions? Their life situation?",
              "PRACTICE: Write out your own testimony in 3-5 minutes—what life was like before Christ, how you came to faith, and what changed after"
            ]
          },
          {
            id: "emotional-discernment",
            title: "Emotional Discernment in Witnessing",
            description: "Reading and responding to emotional barriers",
            duration: "30 min",
            content: [
              "📖 BIBLICAL WISDOM: Proverbs 18:13 warns, 'To answer before listening—that is folly and shame.' Proverbs 20:5 says, 'The purposes of a person's heart are deep waters, but one who has insight draws them out.' Effective witnessing requires emotional intelligence to understand what's really happening beneath the surface.",
              "💡 COMMON EMOTIONAL BARRIERS: (1) HURT - Many reject Christianity because they've been hurt by Christians or feel abandoned by God during suffering. Logic won't reach them until you address the pain. (2) FEAR - Fear of judgment, fear of lifestyle changes required, fear of being wrong. (3) PRIDE - Not wanting to admit need or submit to authority. (4) SHAME - Feeling too 'far gone' or unworthy of grace.",
              "DISCERNING THE REAL ISSUE: Often intellectual objections are smokescreens for emotional resistance. Someone arguing about evolution might actually be wrestling with God's goodness after losing a loved one. Someone raising the 'problem of evil' might be dealing with personal trauma. Ask yourself: 'Is this really about logic, or about something deeper?'",
              "🎯 RESPONDING WITH COMPASSION: When you discern emotional barriers: (1) ACKNOWLEDGE THE PAIN - Don't minimize or rush to fix it. 'That sounds incredibly difficult' validates their experience. (2) SHARE AUTHENTICALLY - Your own struggles and doubts show you're human and trustworthy. (3) DEMONSTRATE GOD'S CHARACTER - Sometimes being present and caring does more than any argument. (4) GIVE TIME - Don't force a decision when someone isn't ready.",
              "Jesus wept with those who wept (John 11:35) before raising Lazarus. He felt compassion for the crowds (Matthew 9:36). Following His example means entering into others' emotional worlds with empathy, not just presenting propositions with precision."
            ],
            exercises: [
              "ROLE-PLAY: Practice with a friend. Have them present an intellectual objection with an emotional undercurrent. Practice identifying and addressing both",
              "JOURNAL: Write about a time you faced emotional barriers to faith. What helped you move forward? How can you offer that to others?",
              "SCRIPTURE STUDY: Study how Paul adapted his approach in Acts 17 (Athens - philosophical approach) vs. Acts 26 (before Agrippa - personal testimony)"
            ]
          }
        ]
      },
      {
        id: "conversational-techniques",
        title: "Conversational Techniques",
        description: "Practical methods for effective spiritual conversations",
        lessons: [
          {
            id: "asking-questions",
            title: "The Power of Questions",
            description: "Using questions to guide discovery",
            duration: "25 min",
            content: [
              "📖 JESUS THE QUESTIONER: Jesus asked over 300 questions in the Gospels! 'What do you want me to do for you?' (Mark 10:51). 'Who do you say that I am?' (Matthew 16:15). 'Do you want to get well?' (John 5:6). Questions engage people, reveal hearts, and allow self-discovery rather than defensive argument.",
              "💡 TYPES OF POWERFUL QUESTIONS: (1) CLARIFYING QUESTIONS - 'What do you mean by that?' helps you understand their actual position. (2) LEADING QUESTIONS - 'If God exists, would you want to know?' reveals openness or resistance. (3) STORY QUESTIONS - 'How did you come to that conclusion?' lets them share their journey.",
              "THE COLUMBO TACTIC: Named after the TV detective, this approach uses innocent curiosity. Instead of 'You're wrong about evolution,' try: 'That's interesting. What evidence convinced you?' or 'Have you considered...?' This disarms defensiveness and turns monologue into dialogue.",
              "🎯 QUESTIONS THAT PROBE WORLDVIEWS: (1) 'Where do you think right and wrong come from?' (2) 'What gives human life value?' (3) 'Is truth relative or absolute?' (4) 'What happens after we die?' These reveal presuppositions and open doors to share how Christianity answers these fundamental questions.",
              "Remember: The goal isn't to 'win' an argument but to help someone think deeply about truth. Questions plant seeds that the Holy Spirit waters. Sometimes the best thing you can do is ask a question that lingers in their mind long after the conversation ends."
            ],
            exercises: [
              "PRACTICE: List 5 questions you could ask when someone says 'All religions are basically the same'",
              "OBSERVATION: This week, practice asking questions in normal conversations. Notice how questions deepen dialogue",
              "PREPARATION: Write out questions for common objections: 'Christianity is intolerant,' 'The Bible has errors,' 'Science disproves God'"
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
        id: "foundations-logic",
        title: "Foundations of Logical Reasoning",
        description: "Understanding the basic principles that govern sound thinking",
        lessons: [
          {
            id: "three-laws-logic",
            title: "The Three Fundamental Laws of Logic",
            description: "Foundational principles of all rational thought",
            duration: "30 min",
            content: [
              "📖 BIBLICAL FOUNDATION: Logic reflects the nature of God, who is Logos (John 1:1). God cannot lie (Titus 1:2) or deny Himself (2 Timothy 2:13) because He is truth itself. The laws of logic aren't arbitrary human inventions—they reflect the character of the divine mind and the structure of reality He created.",
              "💡 THE THREE LAWS: (1) LAW OF IDENTITY: A is A. Everything is itself and not something else. A tree is a tree. God is God. This seems obvious, but it's fundamental to all clear thinking. (2) LAW OF NON-CONTRADICTION: A cannot be both B and not-B at the same time and in the same sense. Something cannot be both true and false simultaneously. (3) LAW OF EXCLUDED MIDDLE: Either A is B or A is not-B. There is no third option. Either God exists or He doesn't—there's no middle ground.",
              "WHY THESE LAWS MATTER: Without these laws, no reasoning is possible. If contradictions were acceptable, then every statement would be meaningless. The statement 'Jesus is Lord' would mean the same as 'Jesus is not Lord.' Science, mathematics, philosophy, theology—all depend on these three laws.",
              "🎯 PRACTICAL EXAMPLES: Law of Identity applied: When someone says 'That's your truth,' respond: 'If truth can contradict itself, the word truth becomes meaningless.' Law of Non-Contradiction applied: 'Jesus was a good teacher' contradicts 'Jesus was a liar' (if He lied about being God). He must be one or the other. Law of Excluded Middle applied: Either the resurrection happened historically or it didn't. 'It's true for you but not for me' violates this law.",
              "These laws exist because we live in a rational universe created by a rational God. When someone rejects these laws (as some postmodern thinkers do), they cannot live consistently with that rejection. They still use logic to argue against logic, which is self-refuting."
            ],
            exercises: [
              "IDENTIFICATION: Find three examples from daily life where people violate the Law of Non-Contradiction (e.g., 'All truth is relative' is itself presented as absolute)",
              "APPLICATION: Write out how each of the three laws applies to the statement 'Jesus is the only way to God'",
              "APOLOGETICS: How would you use these laws to respond to someone who says 'Christianity might be true for you, but not for me'?"
            ]
          },
          {
            id: "valid-sound-arguments",
            title: "Valid vs. Sound Arguments",
            description: "Understanding the difference between form and truth",
            duration: "25 min",
            content: [
              "📖 BIBLICAL DISCERNMENT: Acts 17:11 praises the Bereans who 'examined the Scriptures every day to see if what Paul said was true.' They didn't just accept claims—they tested them. Similarly, we must learn to evaluate arguments for both logical validity (correct form) and soundness (true premises).",
              "💡 VALIDITY = CORRECT FORM: An argument is valid if the conclusion logically follows from the premises. Example: 'All men are mortal. Socrates is a man. Therefore, Socrates is mortal.' The conclusion MUST be true if the premises are true. The structure is correct.",
              "SOUNDNESS = VALIDITY + TRUE PREMISES: A sound argument is both valid AND has true premises. Example: 'All ice cream is frozen. This cone contains ice cream. Therefore, this cone contains something frozen.' Valid structure AND true premises = sound argument that proves its conclusion.",
              "🎯 WHY THIS MATTERS: Someone can construct a perfectly valid argument from false premises. Example: 'All dogs can fly. Fido is a dog. Therefore, Fido can fly.' The logic is valid, but the premise is false, so the argument is unsound. When defending the faith, we need BOTH—valid reasoning AND true premises based on evidence and Scripture.",
              "TESTING ARGUMENTS: When you hear an argument against Christianity, ask two questions: (1) Is the logic valid? Does the conclusion really follow? (2) Are the premises true? Is there evidence for the claims being made? Many objections fail one or both tests."
            ],
            exercises: [
              "PRACTICE: Create three syllogisms—one valid and sound, one valid but unsound, and one invalid",
              "EVALUATION: Analyze this argument: 'If God were good, evil wouldn't exist. Evil exists. Therefore, God isn't good.' Is it valid? Are the premises true?",
              "APOLOGETICS: Find an atheist argument online. Evaluate whether it's valid and whether its premises are true"
            ]
          }
        ]
      },
      {
        id: "deductive-inductive",
        title: "Deductive and Inductive Reasoning",
        description: "Two essential methods of logical argument",
        lessons: [
          {
            id: "deductive-reasoning",
            title: "Deductive Reasoning",
            description: "From general principles to specific conclusions",
            duration: "25 min",
            content: [
              "📖 BIBLICAL EXAMPLE: Romans 6:23 uses deductive logic: 'For the wages of sin is death, but the gift of God is eternal life.' The logic: If you sin (general principle), you deserve death (specific conclusion). If you receive God's gift (general principle), you receive eternal life (specific conclusion).",
              "💡 HOW DEDUCTION WORKS: Deductive arguments move from general premises to specific conclusions with absolute certainty. If the premises are true and the logic is valid, the conclusion MUST be true. Example: 'All humans need salvation. You are human. Therefore, you need salvation.' The conclusion is guaranteed.",
              "THE SYLLOGISM: The classic form of deductive reasoning. Major premise (general principle) + Minor premise (specific case) = Conclusion. Example: 'Whatever begins to exist has a cause. The universe began to exist. Therefore, the universe has a cause.' This is the Kalam Cosmological Argument in deductive form.",
              "🎯 STRENGTH OF DEDUCTION: When premises are true, deduction provides certainty. This is why mathematical proofs use deduction—the conclusions are inescapable. In apologetics, we use deduction to show that IF certain things are true (God's existence, Christ's resurrection), THEN other things must follow (Christianity is true, we should follow Christ).",
              "COMMON FORMS: Modus Ponens (If P then Q. P. Therefore Q.), Modus Tollens (If P then Q. Not Q. Therefore not P.), Hypothetical Syllogism (If P then Q. If Q then R. Therefore, if P then R.). Recognizing these forms helps you construct and evaluate arguments."
            ],
            exercises: [
              "CONSTRUCTION: Write three deductive arguments for Christian truths using syllogistic form",
              "BIBLICAL STUDY: Find three passages where Jesus or Paul uses deductive reasoning (hint: look for 'if...then' statements)",
              "EVALUATION: Identify the logical form of the Moral Argument: 'If God doesn't exist, objective moral values don't exist. Objective moral values DO exist. Therefore, God exists.'"
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
        id: "logic-in-scripture",
        title: "Logic and Rhetoric in Biblical Texts",
        description: "How Scripture employs logical reasoning and persuasive argumentation",
        lessons: [
          {
            id: "pauls-logical-arguments",
            title: "Paul's Logical Arguments in Romans",
            description: "Analyzing the apostle's sophisticated reasoning",
            duration: "35 min",
            content: [
              "📖 ROMANS AS THEOLOGY: The book of Romans is Paul's most systematic theological work, structured as a legal brief proving that salvation comes through faith in Christ alone. It follows rigorous logical progression from problem (human sinfulness) to solution (justification by faith) to application (sanctified living).",
              "💡 ROMANS 1-3 - THE PROBLEM: Paul argues deductively that all humanity is guilty before God. (1) The Gentiles are guilty because creation reveals God's existence, yet they worship created things (Romans 1:18-32). (2) The moralists are guilty because they condemn others while doing the same things (Romans 2:1-16). (3) The Jews are guilty despite having the Law, because the Law reveals sin without providing salvation (Romans 2:17-3:20). Conclusion: 'All have sinned and fall short of the glory of God' (3:23).",
              "ROMANS 5 - ADAM AND CHRIST: Paul uses typology and logical parallelism. Just as sin and death entered through one man (Adam), so righteousness and life come through one man (Christ). The logic: If Adam's one sin brought condemnation to all, how much more does Christ's one act of righteousness bring justification to all who believe! This is called 'from the lesser to the greater' reasoning (kal v'chomer).",
              "🎯 ROMANS 8 - CHAIN REASONING: 'If God is for us, who can be against us? He who did not spare his own Son...will he not also give us all things?' (8:31-32). Paul builds a logical chain: God gave His most precious gift (His Son), therefore He will certainly give lesser gifts. This argument moves from certainty about a greater fact to certainty about lesser facts.",
              "PRACTICAL APPLICATION: When reading Paul's letters, identify: (1) The main argument or thesis statement, (2) How premises build upon each other, (3) Anticipated objections and Paul's responses, (4) The logical connectors ('therefore,' 'for,' 'since,' 'if...then'). This reveals the rational structure of theology."
            ],
            exercises: [
              "OUTLINE: Read Romans 3:21-31 and create a logical outline showing how Paul argues for justification by faith",
              "OBJECTIONS: In Romans 6:1, Paul anticipates an objection: 'Shall we go on sinning so that grace may increase?' Find two other places where Paul raises and answers potential objections",
              "COMPARISON: Compare the logical structure of Romans (systematic argument) with the narrative structure of Luke (historical narrative). What different purposes do these structures serve?"
            ]
          },
          {
            id: "jesus-logical-methods",
            title: "Jesus' Logical and Rhetorical Techniques",
            description: "How Christ used reasoning to teach and confound opponents",
            duration: "30 min",
            content: [
              "📖 THE MASTER TEACHER: Jesus regularly employed sophisticated logical arguments, often leaving opponents speechless. He used syllogisms, analogies, reductio ad absurdum (reducing a position to absurdity), and rhetorical questions—all tools of classical logic and rhetoric.",
              "💡 SYLLOGISTIC REASONING: In Matthew 22:41-46, Jesus uses deductive logic to prove the Messiah must be both David's son and David's Lord. Major premise: David calls the Messiah 'Lord' (Psalm 110:1). Minor premise: A father doesn't normally call his son 'Lord.' Conclusion: The Messiah must be something more than merely David's human descendant—He must be divine. This silenced the Pharisees.",
              "REDUCTIO AD ABSURDUM: When accused of casting out demons by Beelzebul (Matthew 12:24-29), Jesus uses logical reduction to show the absurdity. 'If Satan casts out Satan, he is divided against himself. How then will his kingdom stand?' The argument: Satan wouldn't destroy his own work. By accepting their premise and showing its absurd conclusion, Jesus refutes their accusation.",
              "🎯 ANALOGICAL REASONING: Jesus constantly used 'how much more' arguments. 'If you, being evil, know how to give good gifts to your children, how much more will your Father in heaven give good gifts to those who ask Him?' (Matthew 7:11). Structure: If earthly fathers (imperfect) do X, heavenly Father (perfect) will certainly do Y (something greater). These arguments are both logically sound and emotionally powerful.",
              "THE DOUBLE QUESTION TRAP: In Matthew 21:23-27, when asked 'By what authority do you do these things?', Jesus responds with a question: 'Was John's baptism from heaven or from man?' This creates a logical dilemma—either answer incriminates His questioners. They're forced to admit ignorance. This demonstrates how questions can be more powerful than direct assertions."
            ],
            exercises: [
              "ANALYSIS: Read Mark 2:1-12 (paralytic healed). What logical argument does Jesus make about His authority to forgive sins?",
              "PARABLES: Choose one parable (e.g., Good Samaritan, Prodigal Son) and identify the logical point being made",
              "PRACTICE: Find three examples where Jesus uses 'if...then' or 'how much more' reasoning in the Sermon on the Mount"
            ]
          }
        ]
      },
      {
        id: "biblical-genres-logic",
        title: "Logical Structures in Different Biblical Genres",
        description: "How various types of biblical literature employ reasoning",
        lessons: [
          {
            id: "wisdom-literature-logic",
            title: "Logic in Wisdom Literature",
            description: "Reasoning in Proverbs, Ecclesiastes, and Job",
            duration: "25 min",
            content: [
              "📖 PROVERBS - PRACTICAL SYLLOGISMS: Proverbs presents compressed logical arguments. 'The fear of the LORD is the beginning of knowledge' (1:7) implies: If you want knowledge, you must fear the LORD. 'A gentle answer turns away wrath, but a harsh word stirs up anger' (15:1) presents cause-effect reasoning based on observation.",
              "💡 PARALLELISM AS LOGIC: Hebrew poetry uses parallelism to make logical points. Synonymous parallelism restates the same idea ('The LORD watches over the way of the righteous, but the way of the wicked leads to destruction' - Psalm 1:6). Antithetic parallelism contrasts opposites to clarify meaning. This isn't just poetic—it's logical emphasis.",
              "ECCLESIASTES - LOGICAL EXPLORATION: The Teacher in Ecclesiastes systematically tests various approaches to finding meaning: pleasure (2:1-11), wisdom (2:12-16), work (2:18-23), etc. Each is examined and found wanting. The logical structure: If X were ultimate meaning, we'd find satisfaction. We don't find satisfaction in X. Therefore, X isn't ultimate meaning. Conclusion: Only God provides meaning (12:13-14).",
              "🎯 JOB - THEODICY AND LOGIC: Job and his friends engage in logical argument about suffering and divine justice. The friends assume: Righteous people prosper, wicked people suffer. Job is suffering. Therefore, Job must be wicked (syllogistic reasoning). Job refutes this by showing the minor premise doesn't universally hold—sometimes the wicked prosper and righteous suffer. God's speech (ch. 38-41) uses rhetorical questions to demonstrate the limits of human logic when comprehending divine wisdom.",
              "Understanding these logical structures helps us interpret wisdom literature correctly. These aren't random sayings—they're carefully reasoned arguments about how to live wisely in God's world."
            ],
            exercises: [
              "ANALYSIS: Choose 5 Proverbs and rewrite each as an if-then statement to reveal its logical structure",
              "DEBATE: Read Job 4-5 (Eliphaz's first speech). Outline his logical argument. Where does it go wrong?",
              "SYNTHESIS: How does Ecclesiastes 3:1-8 ('A time for everything') present a logical argument about divine sovereignty and human action?"
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
        id: "embodied-truth",
        title: "Embodying Truth Through Ritual and Ceremony",
        description: "How sacred practices ritualize theological realities",
        lessons: [
          {
            id: "sacramental-logic",
            title: "The Logic of Sacraments",
            description: "How baptism and communion embody theological truths",
            duration: "30 min",
            content: [
              "📖 BIBLICAL FOUNDATION: Jesus instituted baptism (Matthew 28:19) and communion (Luke 22:19-20) as enacted truths. These aren't merely symbolic—they're physical expressions of spiritual realities. Baptism portrays death to sin and resurrection to new life (Romans 6:3-4). Communion proclaims Christ's death 'until he comes' (1 Corinthians 11:26).",
              "💡 BAPTISM - RITUAL LOGIC: The act of baptism follows a logical-theological progression: (1) Going under water = death and burial with Christ, (2) Immersion = cleansing from sin, (3) Rising from water = resurrection to new life. The physical action embodies the spiritual reality. You can't 'die with Christ' literally, but baptism makes that abstract truth tangible and memorable.",
              "COMMUNION - REMEMBRANCE AND PARTICIPATION: 'Do this in remembrance of me' (Luke 22:19). The Eucharist ritualizes multiple truths: (1) Christ's body was broken for us (bread broken), (2) His blood was shed for our sins (wine poured), (3) We participate in His death (eating and drinking), (4) We're united as His body (sharing one loaf). The ceremony teaches theology through action.",
              "🎯 WHY RITUAL MATTERS: Humans are embodied creatures, not pure minds. We learn and remember through physical actions. Neuroscience confirms that ritual creates strong neural pathways. When we physically enact spiritual truths, we engage our whole being—mind, body, and emotions. This makes abstract doctrine personal and memorable.",
              "COVENANTAL STRUCTURE: Biblical rituals often have covenantal structure paralleling ancient Near Eastern treaties: (1) Preamble (who God is), (2) Historical prologue (what God has done), (3) Stipulations (what we must do), (4) Witnesses, (5) Blessings and curses. Recognizing this structure helps us understand the logical flow of ceremonial acts."
            ],
            exercises: [
              "OBSERVATION: If you've been baptized, journal about that experience. What truths did the physical act help you grasp?",
              "THEOLOGY: Read 1 Corinthians 11:17-34. What theological truths does Paul say communion expresses and reinforces?",
              "CREATION: Design a personal ritual that helps you remember and embody one Christian truth (e.g., placing a stone to represent answered prayer)"
            ]
          },
          {
            id: "liturgical-logic",
            title: "The Logical Structure of Liturgy",
            description: "How worship services teach through structure",
            duration: "25 min",
            content: [
              "📖 LITURGY = PROGRESSIVE THEOLOGY: Traditional liturgy follows a logical narrative arc that tells the gospel story. Whether Catholic, Orthodox, Anglican, or liturgical Protestant, worship services generally follow this structure: Call to Worship → Confession → Assurance of Pardon → Scripture → Sermon → Response → Communion → Benediction.",
              "💡 NARRATIVE LOGIC: The worship service enacts the gospel: (1) CALL TO WORSHIP - God initiates, (2) CONFESSION - We acknowledge our sin, (3) ASSURANCE OF PARDON - God forgives through Christ, (4) WORD - God speaks truth, (5) RESPONSE - We commit/offer ourselves, (6) COMMUNION - We remember Christ's sacrifice and our union with Him, (7) SENDING - We go to live as His people. This is the gospel story ritualized weekly.",
              "THE CHURCH YEAR TEACHES THEOLOGY: The liturgical calendar isn't arbitrary. Advent (anticipation) → Christmas (Incarnation) → Epiphany (revelation to nations) → Lent (preparation, fasting) → Holy Week (suffering) → Easter (resurrection) → Pentecost (Spirit's empowerment) → Ordinary Time (living out the faith). Following this cycle annually teaches Christ's life and work systematically.",
              "🎯 CREEDS AS RITUALIZED DOCTRINE: When we recite the Apostles' Creed or Nicene Creed, we're participating in a ritual that reinforces core theological truths. The structure is deliberate: Father (creation), Son (redemption), Spirit (sanctification). Speaking these truths aloud in community reinforces them and creates identity.",
              "PRACTICAL APPLICATION: Even in non-liturgical churches, service structure teaches theology. What does your church's worship order communicate? Does it emphasize God's initiative or human response? Does it balance Word and sacrament? Structure is never neutral—it always teaches."
            ],
            exercises: [
              "ANALYSIS: Attend a liturgical service (or watch online) and note how the structure tells the gospel story",
              "COMPARISON: Compare the service structure of two different traditions. What theological emphases does each structure reveal?",
              "PERSONAL LITURGY: Create a daily prayer liturgy for yourself that follows a logical theological progression"
            ]
          }
        ]
      },
      {
        id: "prayer-proclamation",
        title: "Prayer, Poetry, and Proclamation",
        description: "Ritualizing truth through language and declaration",
        lessons: [
          {
            id: "structured-prayer",
            title: "The Logic of Structured Prayer",
            description: "How prayer frameworks embody theological truths",
            duration: "25 min",
            content: [
              "📖 THE LORD'S PRAYER STRUCTURE: Jesus' model prayer (Matthew 6:9-13) has a deliberate logical structure: (1) Address - 'Our Father in heaven' (relationship and reverence), (2) Priorities - 'hallowed be your name, your kingdom come, your will be done' (God's glory first), (3) Petitions - daily bread, forgiveness, deliverance (our needs second), (4) Conclusion - 'for yours is the kingdom...' (return to God's sovereignty). The structure teaches proper prayer priorities.",
              "💡 ACTS PRAYER MODEL: Another helpful framework: Adoration (praising God for who He is) → Confession (admitting our sin) → Thanksgiving (gratitude for what He's done) → Supplication (requests for ourselves and others). This structure ensures balanced prayer that doesn't become self-focused wish-lists. It ritualizes a proper view of God and self.",
              "LITURGICAL PRAYERS - TESTED TRUTH: Historic prayers like the collect, Te Deum, or Gloria Patri have been refined over centuries to express theological truth precisely. They protect against doctrinal error while elevating language. When we pray these prayers, we participate in the historic church's wisdom.",
              "🎯 WRITTEN VS. SPONTANEOUS: Both written prayers and spontaneous prayers have value. Written prayers ensure theological precision and connect us to church history. Spontaneous prayers express immediate needs authentically. The best prayer life incorporates both—structured prayers provide the framework, spontaneous prayers fill in personal details.",
              "DECLARATION AND SPIRITUAL WARFARE: Some prayers are declarative—proclaiming truth to remind ourselves and assert it against spiritual opposition. 'The LORD is my shepherd, I shall not want' (Psalm 23:1) isn't asking for something; it's declaring reality. Ephesians 6:10-18 presents spiritual armor as declarations of truth to be proclaimed."
            ],
            exercises: [
              "MEMORIZATION: Memorize the Lord's Prayer in a formal translation. Pray it daily this week, meditating on each phrase",
              "PRACTICE: Use the ACTS model for your prayers this week. Notice how structure shapes content",
              "CREATION: Write a collect (formal prayer) that follows this structure: Address to God, acknowledgment of God's attribute, petition based on that attribute, desired result, through Christ. Amen."
            ]
          }
        ]
      }
    ]
  }
};

// Spanish curriculum data
const curriculumDataEs: Record<string, Curriculum> = {
  fallacies: {
    id: "fallacies",
    modules: [
      {
        id: "module-1",
        title: "Introducción a las Falacias",
        description: "Reconociendo el engaño en el razonamiento y los argumentos",
        lessons: [
          {
            id: "lesson-1",
            title: "¿Qué es una Falacia?",
            description: "Comprendiendo los errores en el razonamiento",
            duration: "20 min",
            content: [
              "📖 DEFINICIÓN: Una falacia es un error en el razonamiento que hace que un argumento sea defectuoso. Puede parecer persuasiva, pero viola las reglas de la lógica. Las falacias son las 'sombras'—parecen argumentos reales pero carecen de sustancia.",
              "2 Timoteo 4:3-4 advierte: 'Porque vendrá tiempo cuando no soportarán la sana doctrina, sino que teniendo comezón de oír, se amontonarán maestros conforme a sus propias pasiones, y apartarán sus oídos de la verdad.' Las falacias son herramientas del engaño espiritual.",
              "💡 IDEA CLAVE: Identificar falacias no se trata de ganar debates—se trata de proteger la verdad. Cuando alguien usa razonamiento falaz para atacar la fe, no es mezquino señalarlo. Es defenderloya claridad y la verdad.",
              "Las falacias vienen en dos categorías principales: (1) FALACIAS FORMALES—violan las reglas de la estructura lógica, (2) FALACIAS INFORMALES—usan lenguaje engañoso, emoción inapropiada o información irrelevante.",
              "🎯 POR QUÉ IMPORTA EN APOLOGÉTICA: Los oponentes de la fe a menudo usan razonamiento falaz, a veces sin darse cuenta. Ser capaz de identificar falacias te protege de ser desviado y te ayuda a guiar conversaciones de vuelta a la verdad.",
              "Proverbios 26:4-5 da una instrucción aparentemente contradictoria: 'No respondas al necio según su necedad... Responde al necio según su necedad.' El punto: a veces ignoramos argumentos tontos, otras veces los refutamos. El discernimiento requiere saber cuándo hacer cada cosa—y reconocer falacias ayuda."
            ],
            exercises: [
              "REFLEXIÓN: Piensa en un momento en que alguien usó razonamiento defectuoso para desafiar tu fe. ¿Puedes identificar ahora qué estuvo mal en su argumento?",
              "BÚSQUEDA ESCRITURAL: Lee 2 Corintios 10:5. ¿Cómo se relaciona 'derribar argumentos' con identificar falacias?",
              "PRÁCTICA: Escucha un debate o discusión (en línea o en persona). Anota argumentos que parezcan 'incorrectos' de alguna manera. ¿Puedes empezar a notar cuándo el razonamiento se descarrila?"
            ]
          }
        ]
      }
    ]
  },
  foundations: {
    id: "foundations",
    modules: [
      {
        id: "module-1",
        title: "Introducción a Logos",
        description: "Entendiendo la lógica como estructura divina y razonamiento sagrado",
        lessons: [
          {
            id: "lesson-1",
            title: "¿Qué es Logos?",
            description: "El principio divino de razón y orden",
            duration: "25 min",
            content: [
              "📖 FUNDAMENTO: El término 'Logos' (λόγος) aparece en Juan 1:1: 'En el principio era el Verbo (Logos), y el Verbo era con Dios, y el Verbo era Dios.' Este versículo revela que la lógica, la razón y el orden divino no son invenciones humanas—fluyen de la naturaleza misma de Dios.",
              "Los antiguos griegos usaban 'Logos' para describir el principio racional que gobierna el cosmos. Cuando Juan lo usa para describir a Cristo, está declarando que Jesús es la encarnación de la razón divina misma.",
              "💡 PERSPECTIVA CLAVE: La lógica no es un cálculo frío y mecánico. Es la estructura viva y cálida a través de la cual la verdad se hace visible a las mentes creadas.",
              "🎯 APLICACIÓN PRÁCTICA: Desarrollar el pensamiento lógico es disciplina espiritual. Así como la oración nos conecta con el corazón de Dios, la lógica nos conecta con la mente de Dios."
            ],
            exercises: [
              "MEDITACIÓN: Lee Juan 1:1-14 lentamente. Reflexiona sobre cómo ver a Cristo como 'Logos' cambia tu comprensión de la lógica.",
              "ORACIÓN: Agradece a Dios por el regalo de la razón y pídele que te ayude a desarrollar claridad de pensamiento al servicio de la verdad."
            ]
          }
        ]
      }
    ]
  },
  // Placeholder entries for other tracks
  apologetics: { id: "apologetics", modules: [] },
  witnessing: { id: "witnessing", modules: [] },
  scripture: { id: "scripture", modules: [] },
  emotional: { id: "emotional", modules: [] },
  "apologetics-path": { id: "apologetics-path", modules: [] },
  "witnessing-path": { id: "witnessing-path", modules: [] },
  "logic-path": { id: "logic-path", modules: [] },
  "scriptural-path": { id: "scriptural-path", modules: [] },
  "ceremonial-path": { id: "ceremonial-path", modules: [] }
};
