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
            duration: "15 min",
            content: [
              "Logos is the Greek word for 'word,' 'reason,' and 'principle.' In Christian theology, it represents both divine reason and Christ himself (John 1:1).",
              "Logic is not cold calculation—it is the structure through which truth becomes visible. It is the architecture of reality itself.",
              "When we study logic, we are studying the mind of God made manifest in creation. Every valid argument echoes the order of divine thought.",
            ],
            exercises: [
              "Reflect: How does understanding logic as 'sacred structure' change your view of reasoning?",
              "Journal: Write about a time when clear thinking helped you see truth more clearly.",
            ],
          },
          {
            id: "lesson-2",
            title: "Deductive Reasoning",
            description: "Moving from universal truths to specific conclusions",
            duration: "20 min",
            content: [
              "Deductive reasoning starts with a general principle and applies it to specific cases. If the premises are true and the logic is valid, the conclusion must be true.",
              "Example: All humans are mortal (premise). Socrates is human (premise). Therefore, Socrates is mortal (conclusion).",
              "In faith: God is love (premise). God created you (premise). Therefore, you are created in love (conclusion).",
              "Deductive logic gives us certainty when premises are true. It is the logic of revelation—truths handed down from above.",
            ],
            exercises: [
              "Construct a deductive argument about God's character using Scripture.",
              "Identify the premises and conclusion in this argument: 'All Scripture is God-breathed. 2 Timothy is Scripture. Therefore, 2 Timothy is God-breathed.'",
            ],
          },
          {
            id: "lesson-3",
            title: "Inductive Reasoning",
            description: "Building general truths from specific observations",
            duration: "20 min",
            content: [
              "Inductive reasoning moves from specific observations to general conclusions. It builds patterns from evidence.",
              "Example: The sun has risen every morning of recorded history. Therefore, the sun will probably rise tomorrow.",
              "In faith: Many prayers have been answered in the past. Therefore, prayer is effective.",
              "Inductive reasoning gives us probability, not certainty. It is the logic of witness—truth built from testimony and experience.",
            ],
            exercises: [
              "Gather three personal experiences and form an inductive conclusion about God's faithfulness.",
              "What's the difference in certainty between deductive and inductive reasoning?",
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
            duration: "15 min",
            content: [
              "Every argument has two parts: premises (the evidence) and a conclusion (what the evidence proves).",
              "Premises are statements offered as support. The conclusion is the statement being supported.",
              "Example: 'Jesus died for sinners. You are a sinner. Therefore, Jesus died for you.' The first two statements are premises; the last is the conclusion.",
              "Strong arguments have clear, true premises and a conclusion that follows necessarily or probably.",
            ],
            exercises: [
              "Identify premises and conclusions in Romans 5:8.",
              "Construct your own argument with at least two premises about salvation.",
            ],
          },
          {
            id: "lesson-5",
            title: "Validity vs. Soundness",
            description: "The difference between good form and true content",
            duration: "20 min",
            content: [
              "A valid argument has correct logical structure—if the premises were true, the conclusion would have to be true.",
              "A sound argument is both valid AND has true premises. Soundness = validity + truth.",
              "Example of valid but unsound: 'All cats are immortal. Fluffy is a cat. Therefore, Fluffy is immortal.' (Valid structure, false premise)",
              "We seek sound arguments—those that are both logically correct and factually true.",
            ],
            exercises: [
              "Is this argument valid? 'All Christians love God. John loves God. Therefore, John is a Christian.'",
              "Create a valid argument with false premises, then make it sound by fixing the premises.",
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
