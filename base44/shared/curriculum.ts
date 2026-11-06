// The study library. Seeded into the database by the seedCurriculum function.
// Scripture quotations are from the King James Version (public domain).

const IMG = 'https://media.base44.com/images/public/6aee56731f3f58a24e730082';

export const CURRICULUM = [
  {
    study: {
      slug: 'mark',
      title: 'Mark: The Servant King',
      summary:
        'A fast, vivid account of Jesus as the Son of God who serves, suffers, and rises again.',
      category: 'New Testament',
      level: 'Beginning',
      cover_image: `${IMG}/162796518_generated_image.png`,
      duration_label: 'About 12 minutes a lesson',
      order: 1,
    },
    lessons: [
      {
        title: 'The Voice in the Wilderness',
        scripture_reference: 'Mark 1:1-11',
        scripture_text:
          'The beginning of the gospel of Jesus Christ, the Son of God; As it is written in the prophets, Behold, I send my messenger before thy face, which shall prepare thy way before thee. The voice of one crying in the wilderness, Prepare ye the way of the Lord, make his paths straight.\n\nAnd it came to pass in those days, that Jesus came from Nazareth of Galilee, and was baptized of John in Jordan. And straightway coming up out of the water, he saw the heavens opened, and the Spirit like a dove descending upon him: And there came a voice from heaven, saying, Thou art my beloved Son, in whom I am well pleased.',
        teaching:
          'Mark does not begin with a manger or a genealogy. He begins with a voice shouting in the desert and a man standing in a river. John prepares; Jesus arrives. And before Jesus teaches a single word or heals a single person, the heavens are torn open and a voice names him: my beloved Son, in whom I am well pleased.\n\nThat order matters for everything that follows. In Mark, identity comes before activity. Jesus is not loved because he performs; he acts because he is loved. The Spirit descends and then, in the very next verse, drives him into the wilderness to be tested.\n\nIf you have ever believed that God’s approval is something you earn by doing more, sit with this scene. The Father speaks before the ministry begins. Everything after it is response, not audition.',
        reflection_prompts: [
          'What word or phrase in this passage catches your attention most, and why?',
          'When you imagine God speaking over you, what do you hear? Where does that voice come from?',
          'What would change this week if you began from being loved rather than trying to earn it?',
        ],
        prayer:
          'Father, thank you that you spoke before I did anything at all. Teach me to live from your love rather than for it. Amen.',
      },
      {
        title: 'Sinners and Outcasts',
        scripture_reference: 'Mark 2:13-17',
        scripture_text:
          'And he went forth again by the sea side; and all the multitude resorted unto him, and he taught them. And as he passed by, he saw Levi the son of Alphaeus sitting at the receipt of custom, and said unto him, Follow me. And he arose and followed him.\n\nAnd it came to pass, that, as Jesus sat at meat in his house, many publicans and sinners sat also together with Jesus and his disciples: for there were many, and they followed him. And when the scribes and Pharisees saw him eat with publicans and sinners, they said unto his disciples, How is it that he eateth and drinketh with publicans and sinners? When Jesus heard it, he saith unto them, They that are whole have no need of the physician, but they that are sick: I came not to call the righteous, but sinners to repentance.',
        teaching:
          'Levi collects taxes for Rome. In the eyes of his neighbors he is a traitor and a thief, and he knows it. Jesus walks up to his booth and says two words: follow me. No conditions, no probation, no request that he clean himself up first.\n\nThe scandal is not that Jesus invited him. It is where Jesus went next — to Levi’s table, with Levi’s friends. Eating together in that world meant belonging together. The religious experts could not get past it.\n\nJesus answers their objection with a picture so simple it is hard to miss: the sick need a doctor. He did not come for people who have it together. He came for people who know they do not. Levi’s first act as a disciple is to bring his friends to the table.',
        reflection_prompts: [
          'What would you have felt if you were Levi, hearing “follow me” at your tax booth?',
          'Where in your life do you act as though you need to be well before you can come to Jesus?',
          'Who is at your table? Who might you be quietly avoiding?',
        ],
        prayer:
          'Jesus, you came for the sick, and I am one of them. Thank you for calling me before I was ready. Make my table as open as yours. Amen.',
      },
      {
        title: 'The Storm on the Sea',
        scripture_reference: 'Mark 4:35-41',
        scripture_text:
          'And the same day, when the even was come, he saith unto them, Let us pass over unto the other side. And when they had sent away the multitude, they took him even as he was in the ship. And there were also with him other little ships. And there arose a great storm of wind, and the waves beat into the ship, so that it was now full. And he was in the hinder part of the ship, asleep on a pillow: and they awake him, and say unto him, Master, carest thou not that we perish?\n\nAnd he arose, and rebuked the wind, and said unto the sea, Peace, be still. And the wind ceased, and there was a great calm. And he said unto them, Why are ye so fearful? how is it that ye have no faith? And they feared exceedingly, and said one to another, What manner of man is this, that even the wind and the sea obey him?',
        teaching:
          'The storm is real. These are experienced fishermen who know exactly what drowning looks like, and they are terrified. Jesus is asleep on a cushion — not indifferent, but at rest in a way that unsettles them almost as much as the waves.\n\nTheir question is honest and familiar: do you not care? Notice that Jesus never says the storm was not dangerous. He stands up, speaks to the wind the way you would speak to a restless child, and there is a great calm.\n\nThe disciples move from fearing the storm to fearing the one who calmed it. That is the deeper question Mark keeps asking: not merely whether Jesus can help, but who he is. Faith here is not the absence of fear. It is a turning toward the one in the boat.',
        reflection_prompts: [
          'What storm are you in the middle of right now, in one or two sentences?',
          'Where have you been tempted to pray “do you not care?”',
          'What would it look like to trust Jesus in this, rather than only asking him to remove it?',
        ],
        prayer:
          'Lord, the wind is loud. You are in the boat with me. Quiet what cannot be quieted in my own strength, and give me rest that is not denial. Amen.',
      },
      {
        title: 'Who Do You Say I Am?',
        scripture_reference: 'Mark 8:27-33',
        scripture_text:
          'And Jesus went out, and his disciples, into the towns of Caesarea Philippi: and by the way he asked his disciples, saying unto them, Whom do men say that I am? And they answered, John the Baptist: but some say, Elias; and others, One of the prophets. And he saith unto them, But whom say ye that I am? And Peter answereth and saith unto him, Thou art the Christ.\n\nAnd he began to teach them, that the Son of man must suffer many things, and be rejected of the elders, and of the chief priests, and scribes, and be killed, and after three days rise again. And he spake that saying openly. And Peter took him, and began to rebuke him. But when he had turned about and looked on his disciples, he rebuked Peter, saying, Get thee behind me, Satan: for thou savourest not the things that be of God, but the things that be of men.',
        teaching:
          'Peter gets it right and then gets it wrong within a few verses. He names Jesus as the Christ — the anointed one Israel had waited for. Then Jesus explains what that anointing actually means: rejection, suffering, death, and after three days, resurrection.\n\nPeter’s rebuke is not villainy. It is love that has not yet made room for a cross. He has a picture of the Messiah, and this Messiah does not fit it. Jesus’s response is sharp because the stakes are sharp: we do not get to keep a Christ of our own design.\n\nMark puts the question in the middle of his Gospel for a reason: who do you say I am? Not what your tradition says, not what your culture says. Take your time with it. Faith in the real Jesus often costs us a version of him we preferred.',
        reflection_prompts: [
          'How would you answer Jesus’s question in your own words right now?',
          'Which parts of Jesus are easy for you to accept, and which do you resist?',
          'Where might following him cost you something you have not yet been willing to give?',
        ],
        prayer:
          'Jesus, I want you as you actually are, not as I have edited you. Give me the honesty to keep meeting the real one. Amen.',
      },
      {
        title: 'The Servant Who Gives His Life',
        scripture_reference: 'Mark 10:42-45',
        scripture_text:
          'But Jesus called them to him, and saith unto them, Ye know that they which are accounted to rule over the Gentiles exercise lordship over them; and their great ones exercise authority upon them. But so shall it not be among you: but whosoever will be great among you, shall be your minister: And whosoever of you will be the chiefest, shall be servant of all. For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.',
        teaching:
          'James and John have just asked to sit on Jesus’s right and left when he comes into his glory. It is a breathtakingly human request — status, proximity, a place above the others. The other ten are indignant, which means they wanted it too.\n\nJesus does not scold ambition. He redefines it. Greatness in his kingdom is measured by service, and the measuring stick is himself: the Son of Man who came not to be served but to serve, and to give his life as a ransom for many.\n\nThis is the heart of Mark. The disciples want a throne; Jesus is headed for a cross. To follow him is to learn that the way up is down, that the most dignified person in the room is often the one holding the towel.',
        reflection_prompts: [
          'Where do you catch yourself wanting to be above rather than among?',
          'What would serving — rather than being served — look like in one real relationship this week?',
          'How does Jesus’s own posture change how you want to lead?',
        ],
        prayer:
          'Lord, teach me the towel and the basin. Make me willing to be small where it costs me, for your sake and not for my reputation. Amen.',
      },
      {
        title: 'The Tomb Was Empty',
        scripture_reference: 'Mark 16:1-8',
        scripture_text:
          'And when the sabbath was past, Mary Magdalene, and Mary the mother of James, and Salome, had bought sweet spices, that they might come and anoint him. And very early in the morning the first day of the week, they came unto the sepulchre at the rising of the sun. And they said among themselves, Who shall roll us away the stone from the door of the sepulchre? And when they looked, they saw that the stone was rolled away: for it was very great.\n\nAnd entering into the sepulchre, they saw a young man sitting on the right side, clothed in a long white garment; and they were affrighted. And he saith unto them, Be not affrighted: Ye seek Jesus of Nazareth, which was crucified: he is risen; he is not here: behold the place where they laid him. But go your way, tell his disciples and Peter that he goeth before you into Galilee: there shall ye see him, as he said unto you. And they went out quickly, and fled from the sepulchre; for they trembled and were amazed: neither said they any thing to any man; for they were afraid.',
        teaching:
          'The women come to finish a burial, not to witness a resurrection. They are carrying spices and a practical worry: who will roll the stone away? Grief is often like that — small logistics inside enormous loss.\n\nThe stone is already moved. Inside, a messenger speaks two sentences that split history: he is risen; he is not here. And then an astonishing detail, “and Peter.” The one who denied him three times is named by name. Failure does not disqualify you from the invitation.\n\nMark ends his Gospel not with triumph but with trembling and fear. He leaves the disciples — and us — standing in front of an empty tomb with a message to carry. That is where faith begins.',
        reflection_prompts: [
          'Why do you think Mark ends with fear rather than celebration?',
          'How does the phrase “and Peter” speak to you today?',
          'What would you have to tell someone if the tomb really is empty?',
        ],
        prayer:
          'Risen Lord, you are not where we left you. Thank you that you name the ones who failed and call them back. Send me, trembling as I am. Amen.',
      },
    ],
  },
  {
    study: {
      slug: 'psalms',
      title: 'Psalms: Honest Prayers',
      summary:
        'Five psalms that teach us to bring praise, grief, confession and wonder to God.',
      category: 'Psalms & Wisdom',
      level: 'Beginning',
      cover_image: `${IMG}/b6a8220ff_generated_image.png`,
      duration_label: 'About 10 minutes a lesson',
      order: 2,
    },
    lessons: [
      {
        title: 'The Shepherd',
        scripture_reference: 'Psalm 23',
        scripture_text:
          'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.\n\nYea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
        teaching:
          'David was a shepherd before he was a king, so he knows what the metaphor costs. A shepherd does not make sheep rich or clever. He makes them safe, fed, and led.\n\nWatch the middle of the psalm change. It starts by speaking about God — he makes me, he leads me — and in the darkest line it switches to speaking to him: thou art with me. The valley does not disappear. The rod and staff are not a promise that nothing frightening will happen, but that someone is present while it does.\n\nThen the table: a meal set in front of enemies, oil poured out, a cup overflowing. Goodness and mercy are not rewards waiting at the end. They follow behind you, the way a shepherd walks behind the flock.',
        reflection_prompts: [
          'Which line of this psalm feels most true to your life this week?',
          'Where is your “valley” right now, and what would “thou art with me” mean there?',
          'What would it look like to let goodness and mercy follow you instead of chasing them?',
        ],
        prayer:
          'Good Shepherd, I do not know the way ahead, and you do. Lead me, feed me, and stay with me in the dark. Amen.',
      },
      {
        title: 'How Long, O Lord?',
        scripture_reference: 'Psalm 13',
        scripture_text:
          'How long wilt thou forget me, O LORD? for ever? how long wilt thou hide thy face from me? How long shall I take counsel in my soul, having sorrow in my heart daily? how long shall mine enemy be exalted over me?\n\nConsider and hear me, O LORD my God: lighten mine eyes, lest I sleep the sleep of death; Lest mine enemy say, I have prevailed against him; and those that trouble me rejoice when I am moved. But I have trusted in thy mercy; my heart shall rejoice in thy salvation. I will sing unto the LORD, because he hath dealt bountifully with me.',
        teaching:
          'This is a short psalm with almost no resolution. Four times David asks “how long?” — the same question grief asks when the calendar keeps moving and nothing changes. He does not tidy it up or apologize for it.\n\nWhat he does is aim it. His complaint is not thrown into the air; it is spoken to the LORD. Even the accusation — you have forgotten me — is an act of faith, because you only accuse someone you still believe is there.\n\nBy the last two verses the tone lifts, but nothing in his circumstances has been fixed. He chooses to trust mercy he cannot yet see. That is not pretending. It is the stubborn hope of someone who has decided where to bring his sorrow.',
        reflection_prompts: [
          'What “how long?” are you carrying at the moment?',
          'What would change if you said it directly to God rather than only to yourself?',
          'Where have you seen God be faithful before, even when the waiting was long?',
        ],
        prayer:
          'O Lord, how long? You can hold my impatience. I bring it to you instead of away from you. Keep my eyes open to your mercy. Amen.',
      },
      {
        title: 'Create in Me a Clean Heart',
        scripture_reference: 'Psalm 51:1-12',
        scripture_text:
          'Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my transgressions. Wash me throughly from mine iniquity, and cleanse me from my sin. For I acknowledge my transgressions: and my sin is ever before me.\n\nHide thy face from my sins, and blot out all mine iniquities. Create in me a clean heart, O God; and renew a right spirit within me. Cast me not away from thy presence; and take not thy holy spirit from me. Restore unto me the joy of thy salvation; and uphold me with thy free spirit.',
        teaching:
          'Tradition ties this psalm to David after his worst failure — the abuse of power, the betrayal, the death he arranged. He does not minimize it. He does not explain it. He names it: my sin is ever before me.\n\nBut notice where he goes for hope. Not to his own remorse, not to a plan for making it up. He appeals to God’s mercy — the multitude of thy tender mercies. He asks for something he cannot manufacture: a clean heart. Create, not clean up. Only God makes something out of nothing.\n\nAnd he asks that the joy would come back. Shame tells us that joy is now off-limits. This prayer says otherwise: restoration is the point, not permanent penance. Confession is not groveling. It is walking into the light and finding a Father there.',
        reflection_prompts: [
          'What are you carrying that you have not yet said out loud to God?',
          'Where do you confuse shame with repentance?',
          'What would “restore unto me the joy” look like in your week?',
        ],
        prayer:
          'Merciful God, I bring the whole of it into the light. Wash me, create in me a clean heart, and give me back the joy of your salvation. Amen.',
      },
      {
        title: 'Be Still and Know',
        scripture_reference: 'Psalm 46:1-3, 10-11',
        scripture_text:
          'God is our refuge and strength, a very present help in trouble. Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea; Though the waters thereof roar and be troubled, though the mountains shake with the swelling thereof. Selah.\n\nBe still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth. The LORD of hosts is with us; the God of Jacob is our refuge. Selah.',
        teaching:
          'The psalm imagines the worst: mountains sliding into the sea, waters roaring, nations in uproar. It does not pretend the world is calm. It says God is a refuge in the middle of it — a very present help, not a distant one.\n\n“Be still, and know” is not a suggestion to relax. The word carries the sense of letting go, of slackening your grip. It is spoken in the middle of the noise and it addresses the people who are running. Stop pretending you can hold this together by force.\n\nAnd the refrain that frames it: the LORD of hosts is with us. Not the LORD of hosts is watching. With us. Two times in a few short verses the psalm repeats it, because we forget it that quickly.',
        reflection_prompts: [
          'What noise is loudest in your life at the moment?',
          'What are you gripping that God is asking you to loosen?',
          'How could you practice stillness with God this week, even briefly?',
        ],
        prayer:
          'God of Jacob, you are with us. I let go of what I cannot hold. Be my refuge while the world roars. Amen.',
      },
      {
        title: 'Bless the LORD, O My Soul',
        scripture_reference: 'Psalm 103:1-12',
        scripture_text:
          'Bless the LORD, O my soul: and all that is within me, bless his holy name. Bless the LORD, O my soul, and forget not all his benefits: Who forgiveth all thine iniquities; who healeth all thy diseases; Who redeemeth thy life from destruction; who crowneth thee with lovingkindness and tender mercies; Who satisfieth thy mouth with good things; so that thy youth is renewed like the eagle’s.\n\nThe LORD is merciful and gracious, slow to anger, and plenteous in mercy. He hath not dealt with us after our sins; nor rewarded us according to our iniquities. For as the heaven is high above the earth, so great is his mercy toward them that fear him. As far as the east is from the west, so far hath he removed our transgressions from us.',
        teaching:
          'David talks to himself here. Bless the LORD, O my soul — as if his soul needed reminding, because it did, and so does ours. Gratitude in this psalm is not a mood. It is a list deliberately recited against forgetfulness.\n\nLook at the list: forgiveness, healing, redemption, being crowned with love, being satisfied with good things. And then the measurements. As high as the heavens above the earth. As far as the east from the west. There is no east of east — the distance never ends. That is how far your sins have gone.\n\nNotice too, “he hath not dealt with us after our sins.” God’s patience is not our patience with extra restraint. It is a different order of mercy altogether.',
        reflection_prompts: [
          'Which of God’s benefits in this psalm do you most easily forget?',
          'Where are you still expecting God to deal with you according to your sins?',
          'What would you put on your own list of “benefits” tonight?',
        ],
        prayer:
          'Bless the LORD, O my soul. Thank you for mercy as wide as the east is from the west. Teach me to remember. Amen.',
      },
    ],
  },
  {
    study: {
      slug: 'philippians',
      title: 'Philippians: Joy Under Pressure',
      summary:
        'Paul writes from prison about a joy that does not depend on circumstances.',
      category: 'New Testament',
      level: 'Growing',
      cover_image: `${IMG}/f6c292567_generated_image.png`,
      duration_label: 'About 14 minutes a lesson',
      order: 3,
    },
    lessons: [
      {
        title: 'Confident of This',
        scripture_reference: 'Philippians 1:3-11',
        scripture_text:
          'I thank my God upon every remembrance of you, Always in every prayer of mine for you all making request with joy, For your fellowship in the gospel from the first day until now; Being confident of this very thing, that he which hath begun a good work in you will perform it until the day of Jesus Christ.\n\nAnd this I pray, that your love may abound yet more and more in knowledge and in all judgment; That ye may approve things that are excellent; that ye may be sincere and without offence till the day of Christ; Being filled with the fruits of righteousness, which are by Jesus Christ, unto the glory and praise of God.',
        teaching:
          'Paul is in chains when he writes this, and his first instinct is gratitude for people. Not for his freedom, or his health, or the outcome of his trial — for the Philippians, and for what God is doing in them.\n\nThe confidence in verse six is not confidence in the Philippians. It is confidence in the one who began the work. You are not the author of your own growth, and you are not the one who has to finish it.\n\nThen his prayer gets specific: that love would abound in knowledge and judgment, that they would approve what is excellent, that they would be sincere. Love without knowledge is sentiment; knowledge without love is cold. He asks for both, together, filled with the fruit of righteousness that comes from Jesus.',
        reflection_prompts: [
          'Who comes to mind when you read “I thank my God upon every remembrance of you”?',
          'Where are you tempted to believe the work in you depends entirely on you?',
          'What would it look like for your love to grow in knowledge this month?',
        ],
        prayer:
          'Father, thank you for beginning a work in me and for promising to finish it. Let my love abound in knowledge, and keep me sincere. Amen.',
      },
      {
        title: 'To Live Is Christ',
        scripture_reference: 'Philippians 1:12-26',
        scripture_text:
          'But I would ye should understand, brethren, that the things which happened unto me have fallen out rather unto the furtherance of the gospel; So that my bonds in Christ are manifest in all the palace, and in all other places.\n\nFor to me to live is Christ, and to die is gain. But if I live in the flesh, this is the fruit of my labour: yet what I shall choose I wot not. For I am in a strait betwixt two, having a desire to depart, and to be with Christ; which is far better: Nevertheless to abide in the flesh is more needful for you.',
        teaching:
          'Paul refuses to call his imprisonment a setback. The guards know why he is there. The gospel has walked into the palace through his chains. What looked like a closed door became a pulpit.\n\nThen the sentence that anchors the whole letter: for to me to live is Christ, and to die is gain. Both directions are win. That is a strange kind of freedom, and it is not resignation — he genuinely wants to stay, because the Philippians need him.\n\nNotice that Paul’s life is not organized around his circumstances improving. It is organized around Christ being known. When that is the center, a prison and a palace stop being the main story.',
        reflection_prompts: [
          'What circumstance in your life have you been reading as a setback?',
          'What would it mean, practically, for “to live is Christ” today?',
          'What are you still holding as the thing that must go well for you to be okay?',
        ],
        prayer:
          'Jesus, be the center of my life, not my circumstances. Use even the things I would not have chosen. Amen.',
      },
      {
        title: 'The Mind of Christ',
        scripture_reference: 'Philippians 2:1-11',
        scripture_text:
          'Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves. Look not every man on his own things, but every man also on the things of others.\n\nLet this mind be in you, which was also in Christ Jesus: Who, being in the form of God, thought it not robbery to be equal with God: But made himself of no reputation, and took upon him the form of a servant, and was made in the likeness of men: And being found in fashion as a man, he humbled himself, and became obedient unto death, even the death of the cross. Wherefore God also hath highly exalted him, and given him a name which is above every name.',
        teaching:
          'This may be the oldest Christian hymn we have, and Paul drops it into the middle of an argument about getting along. The cure for rivalry is not a better argument. It is a different mind.\n\nFollow the descent: in the form of God, made himself of no reputation, took the form of a servant, humbled himself, obedient to death, even the death of the cross. Five steps down, and Paul says this is what God is actually like.\n\nThen the ascent: therefore God highly exalted him. The way up in this letter runs through the way down. If we want the mind of Christ, we are asking for the willingness to be overlooked, to serve without an audience, to let someone else be right.',
        reflection_prompts: [
          'Where is rivalry or the need to look good shaping how you treat someone?',
          'What would “esteeming another better than yourself” look like concretely this week?',
          'Which step of Christ’s descent is hardest for you to imitate?',
        ],
        prayer:
          'Lord Jesus, you stepped down when you had every right to stay. Give me your mind, especially where I want to be first. Amen.',
      },
      {
        title: 'Pressing On',
        scripture_reference: 'Philippians 3:7-14',
        scripture_text:
          'But what things were gain to me, those I counted loss for Christ. Yea doubtless, and I count all things but loss for the excellency of the knowledge of Christ Jesus my Lord: for whom I have suffered the loss of all things, and do count them but dung, that I may win Christ.\n\nNot as though I had already attained, either were already perfect: but I follow after, if that I may apprehend that for which also I am apprehended of Christ Jesus. Brethren, I count not myself to have apprehended: but this one thing I do, forgetting those things which are behind, and reaching forth unto those things which are before, I press toward the mark for the prize of the high calling of God in Christ Jesus.',
        teaching:
          'Paul had an impressive résumé, and he stacks it up earlier in the chapter only to set it on fire. Everything he once counted as gain he now counts as loss, because of the worth of knowing Christ.\n\nBut this is not a man who has arrived. Not as though I had already attained — he says it twice, in case we mistook his confidence for completion. He is still walking, still reaching, still pressing.\n\nAnd he names the discipline: forgetting what lies behind. For some of us that means failures we keep rehearsing. For others, successes we keep polishing. Either way, the past makes a poor compass. The prize is ahead, and it is Christ who has already taken hold of us.',
        reflection_prompts: [
          'What from your past — failure or success — is still setting your direction?',
          'Where do you need to hear “not as though I had already attained”?',
          'What does pressing on look like for you in this season?',
        ],
        prayer:
          'Jesus, you have taken hold of me. Let me release what is behind and reach for what is ahead, with my eyes on you. Amen.',
      },
      {
        title: 'The Peace That Guards',
        scripture_reference: 'Philippians 4:4-13',
        scripture_text:
          'Rejoice in the Lord alway: and again I say, Rejoice. Let your moderation be known unto all men. The Lord is at hand. Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.\n\nNot that I speak in respect of want: for I have learned, in whatsoever state I am, therewith to be content. I know both how to be abased, and I know how to abound: every where and in all things I am instructed both to be full and to be hungry, both to abound and to suffer need. I can do all things through Christ which strengtheneth me.',
        teaching:
          'Rejoice — again — and then the most practical sentence in the letter: be careful for nothing. Stop being anxious about everything, and instead bring everything. Not the tidy version of your requests. Everything, with thanksgiving.\n\nThe promise is not that the circumstances change. It is that peace guards your heart and mind like a garrison. Peace that passes understanding is not peace that makes sense of the situation; it is peace that does not depend on the situation making sense.\n\n“I can do all things through Christ” is often quoted at athletes. In context it means: I can be full and I can be hungry, I can abound and I can be in need, and Christ is enough in both.',
        reflection_prompts: [
          'What are you anxious about that you have not yet actually prayed about?',
          'What would “with thanksgiving” add to how you bring your requests?',
          'Where do you need contentment rather than a change in circumstances?',
        ],
        prayer:
          'Lord, I bring you the whole list — not the tidy version. Guard my heart with your peace, and teach me to be content in you. Amen.',
      },
    ],
  },
  {
    study: {
      slug: 'prayer',
      title: 'Prayer: Learning to Speak with God',
      summary:
        'A gentle practice for people who want to pray but are not sure how to start.',
      category: 'Foundations',
      level: 'Beginning',
      cover_image: `${IMG}/cf8e73cb1_generated_image.png`,
      duration_label: 'About 10 minutes a lesson',
      order: 4,
    },
    lessons: [
      {
        title: 'When You Pray',
        scripture_reference: 'Matthew 6:5-13',
        scripture_text:
          'And when thou prayest, thou shalt not be as the hypocrites are: for they love to pray standing in the synagogues and in the corners of the streets, that they may be seen of men. Verily I say unto you, They have their reward. But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly.\n\nBut when ye pray, use not vain repetitions, as the heathen do: for they think that they shall be heard for their much speaking. Be not ye therefore like unto them: for your Father knoweth what things ye have need of, before ye ask him. After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name. Thy kingdom come. Thy will be done in earth, as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we forgive our debtors. And lead us not into temptation, but deliver us from evil.',
        teaching:
          'Jesus assumes his followers pray — when you pray, not if. But he clears away two things that make prayer harder than it needs to be: performing for an audience, and piling up words as though volume were the point.\n\nHis alternative is startlingly simple. A shut door. A Father who sees in secret. And a short pattern prayer that begins not with your needs but with God’s name, God’s kingdom, God’s will — and then moves to bread, forgiveness, and protection.\n\nNotice how ordinary the requests are. Daily bread. Debts. Temptation. Prayer is not a formal address to a distant official. It is a child in a room with a door, talking to someone who already knows.',
        reflection_prompts: [
          'What does your prayer life look like when no one is watching?',
          'Where might you be performing rather than speaking honestly?',
          'Pray the Lord’s Prayer slowly today — which line catches you?',
        ],
        prayer:
          'Our Father in heaven, hallowed be your name. Your kingdom come, your will be done — in me, today. Amen.',
      },
      {
        title: 'Ask, Seek, Knock',
        scripture_reference: 'Luke 11:5-13',
        scripture_text:
          'And he said unto them, Which of you shall have a friend, and shall go unto him at midnight, and say unto him, Friend, lend me three loaves; For a friend of mine in his journey is come to me, and I have nothing to set before him? And he from within shall answer and say, Trouble me not: the door is now shut, and my children are with me in bed; I cannot rise and give thee. I say unto you, Though he will not rise and give him, because he is his friend, yet because of his importunity he will rise and give him as many as he needeth.\n\nAnd I say unto you, Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you. For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened. If a son shall ask bread of any of you that is a father, will he give him a stone? or if he ask a fish, will he for a fish give him a serpent? If ye then, being evil, know how to give good gifts unto your children: how much more shall your heavenly Father give the Holy Spirit to them that ask him?',
        teaching:
          'The friend at midnight is a story about persistence, and it is a little uncomfortable. The man inside does not get up because of friendship. He gets up because his neighbor will not stop knocking.\n\nJesus is not saying God is a grumpy sleeper who gives in to annoyance. He is arguing from the lesser to the greater: if even a reluctant friend answers persistence, how much more will a good Father answer his children?\n\nAnd look at what the Father gives. Not just bread — the Holy Spirit. The deepest answer to prayer is often not the thing we asked for but more of God himself. Ask, seek, knock are all present tense, ongoing. Keep coming back. That is the point.',
        reflection_prompts: [
          'What have you stopped asking for because you got tired of asking?',
          'What would it look like to be persistent without becoming demanding?',
          'How does it change your praying to know the Father gives the Holy Spirit?',
        ],
        prayer:
          'Father, you are not reluctant with me. Give me the persistence to keep knocking, and give me yourself above everything I ask. Amen.',
      },
      {
        title: 'Pour Out Your Heart',
        scripture_reference: 'Psalm 62:5-8',
        scripture_text:
          'My soul, wait thou only upon God; for my expectation is from him. He only is my rock and my salvation: he is my defence; I shall not be moved. In God is my salvation and my glory: the rock of my strength, and my refuge, is in God.\n\nTrust in him at all times; ye people, pour out your heart before him: God is a refuge for us. Selah.',
        teaching:
          'This psalm repeats itself on purpose. Rock, salvation, defence, refuge — the same handful of words, circled again and again like a path worn into grass. Repetition is how a truth moves from the page into the bones.\n\nAnd then the invitation: pour out your heart before him. Not summarize. Not sanitize. Pour — the way you tip a jug until nothing is left in it. God is a refuge, which means he can take what you bring.\n\nThe word Selah interrupts the psalm, probably a musical pause. Stop here. Let it land. Prayer is not only speaking; it is also waiting in the quiet after you have said the true thing.',
        reflection_prompts: [
          'What would it sound like to actually pour out your heart today, without editing?',
          'Which image — rock, salvation, defence, refuge — do you need most right now?',
          'Where is God inviting you to pause rather than fill the silence?',
        ],
        prayer:
          'God my rock, I pour it all out — the fear, the hope, the unfinished sentences. Be my refuge and let me rest here. Amen.',
      },
      {
        title: 'When You Do Not Know What to Say',
        scripture_reference: 'Romans 8:26-28',
        scripture_text:
          'Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be uttered. And he that searcheth the hearts knoweth what is the mind of the Spirit, because he maketh intercession for the saints according to the will of God.\n\nAnd we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
        teaching:
          'There are seasons when prayer runs out of words. Grief, exhaustion, confusion — the kind of tired where even naming what is wrong feels like too much.\n\nPaul says that is not a failure of prayer. It is exactly where the Spirit steps in. We do not know what we should pray for; the Spirit intercedes with groanings that cannot be uttered. And the one who searches hearts understands, because he knows the mind of the Spirit.\n\nThat means your wordless sigh is not prayer’s breakdown. It is prayer in a language you do not speak yet, translated perfectly by someone who does. You do not have to arrive with the right words. You only have to arrive.',
        reflection_prompts: [
          'When have you been too tired to find words for God?',
          'What does it mean to you that the Spirit prays for you?',
          'How does Romans 8:28 read differently when you hear it as a promise about God’s purpose rather than about easy outcomes?',
        ],
        prayer:
          'Spirit of God, pray for me when I cannot. Take my wordless ache and carry it to the Father. I am trusting your translation. Amen.',
      },
      {
        title: 'Without Ceasing',
        scripture_reference: '1 Thessalonians 5:16-18',
        scripture_text:
          'Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.',
        teaching:
          'Three commands, eleven words, and they sound impossible. Rejoice always? Pray without ceasing? Give thanks in everything? If these are a checklist, we fail before breakfast.\n\nBut Paul is not describing a permanent prayer meeting. He is describing a life with an open line — small turns toward God woven through the day: a thanks at the sink, a name lifted while walking to the car, a sigh in a meeting. Praying without ceasing is less about duration and more about direction.\n\nAnd notice it is “in every thing,” not “for every thing.” Not every thing that happens is good. But in the middle of all of it, there is something to be grateful for, and someone to say it to. This is the will of God for you: not a heavy requirement, but an invitation into constant company.',
        reflection_prompts: [
          'What small, repeating moment in your day could become a moment of prayer?',
          'Where do you confuse giving thanks in everything with pretending everything is fine?',
          'What would change if you treated prayer as a direction rather than an event?',
        ],
        prayer:
          'Lord, keep the line open today. In the ordinary and the hard, turn my heart toward you. Thank you for being near. Amen.',
      },
    ],
  },
  {
    study: {
      slug: 'genesis',
      title: 'Genesis: In the Beginning',
      summary:
        'Creation, image, garden, exile and calling — the opening chapters of the story.',
      category: 'Old Testament',
      level: 'Beginning',
      cover_image: `${IMG}/6c37bce93_generated_image.png`,
      duration_label: 'About 12 minutes a lesson',
      order: 5,
    },
    lessons: [
      {
        title: 'In the Beginning',
        scripture_reference: 'Genesis 1:1-5',
        scripture_text:
          'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.\n\nAnd God said, Let there be light: and there was light. And God saw the light, that it was good: and God divided the light from the darkness. And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
        teaching:
          'The Bible does not begin by explaining God. It simply places him there, before everything, over the formless and empty dark. No origin story, no committee of gods, no cosmic accident — just “in the beginning, God.”\n\nThen the Spirit hovers over the waters like a bird over a nest, and God speaks. Light appears, and God calls it good. That pattern — God speaks, creation answers, God calls it good — runs through the whole chapter and quietly says something enormous about who we are dealing with.\n\nBefore you read anything else in Genesis, sit with this: the chaos is not the last word, and God is not frightened of the dark. He is already there, hovering, about to speak.',
        reflection_prompts: [
          'What in your life feels “without form, and void” right now?',
          'What does it mean that God was present in the darkness before the light?',
          'Where might God be speaking light into something you have given up on?',
        ],
        prayer:
          'Creator God, you hovered over the chaos and spoke light. Speak into the formless places in me. Let there be light. Amen.',
      },
      {
        title: 'In His Image',
        scripture_reference: 'Genesis 1:26-31',
        scripture_text:
          'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.\n\nSo God created man in his own image, in the image of God created he him; male and female created he them. And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.\n\nAnd God saw every thing that he had made, and, behold, it was very good.',
        teaching:
          'Everything in Genesis 1 is good. Only one thing is called very good: the whole finished picture, with human beings in it. You are not an afterthought appended to creation. You are the reason the chapter ends the way it does.\n\nTo be made in God’s image is not to look like him physically. It is to represent him — to carry his likeness into the world as a steward rather than an owner. The dominion given here is a trust, not a license.\n\nNotice it is spoken to them, plural, male and female together. The image of God is not carried by one kind of person. And the verdict comes before any of them have done a single thing to earn it. You were called very good before you were useful.',
        reflection_prompts: [
          'What changes when you hear “very good” spoken over you before you have achieved anything?',
          'Where are you tempted to treat the world as something to own rather than to steward?',
          'How does seeing God’s image in every person change how you treat someone difficult?',
        ],
        prayer:
          'God, thank you for making me in your image and calling me good. Teach me to treat every person as carrying your likeness. Amen.',
      },
      {
        title: 'The Garden and the Gift',
        scripture_reference: 'Genesis 2:7-9, 15-17',
        scripture_text:
          'And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul. And the LORD God planted a garden eastward in Eden; and there he put the man whom he had formed. And out of the ground made the LORD God to grow every tree that is pleasant to the sight, and good for food; the tree of life also in the midst of the garden, and the tree of the knowledge of good and evil.\n\nAnd the LORD God took the man, and put him into the garden of Eden to dress it and to keep it. And the LORD God commanded the man, saying, Of every tree of the garden thou mayest freely eat: But of the tree of the knowledge of good and evil, thou shalt not eat of it: for in the day that thou eatest thereof thou shalt surely die.',
        teaching:
          'This is an intimate scene. God shapes a person out of dirt, breathes into his nostrils, and he becomes a living soul. Dust plus breath — that is what you are. Lowly enough to stay humble, close enough to be loved.\n\nThe garden is not a reward for good behavior; it is a gift given before any command. And work appears before the fall: to dress and keep the garden. Labor is not a punishment. It is part of what it means to be human.\n\nThen the one boundary, and note how wide it is: of every tree thou mayest freely eat. One tree is withheld. The command is not stinginess. It is a boundary that makes trust possible — and the story of the next chapter will be about what happens when the boundary is treated as a cage.',
        reflection_prompts: [
          'What does it mean to you that God formed you from dust and breathed life into you?',
          'What good work has God given you to “dress and keep”?',
          'Where do you experience God’s boundaries as protection rather than restriction?',
        ],
        prayer:
          'Lord God, you shaped me and breathed life into me. Help me trust the boundaries you have set, and tend what you have given me. Amen.',
      },
      {
        title: 'The Question in the Garden',
        scripture_reference: 'Genesis 3:1-13',
        scripture_text:
          'Now the serpent was more subtil than any beast of the field which the LORD God had made. And he said unto the woman, Yea, hath God said, Ye shall not eat of every tree of the garden? And the woman said unto the serpent, We may eat of the fruit of the trees of the garden: But of the fruit of the tree which is in the midst of the garden, God hath said, Ye shall not eat of it, neither shall ye touch it, lest ye die. And the serpent said unto the woman, Ye shall not surely die: For God doth know that in the day ye eat thereof, then your eyes shall be opened, and ye shall be as gods, knowing good and evil.\n\nAnd when the woman saw that the tree was good for food, and that it was pleasant to the eyes, and a tree to be desired to make one wise, she took of the fruit thereof, and did eat, and gave also unto her husband with her; and he did eat.\n\nAnd the LORD God called unto Adam, and said unto him, Where art thou? And he said, I heard thy voice in the garden, and I was afraid, because I was naked; and I hid myself.',
        teaching:
          'The serpent’s first move is not a denial; it is a question that distorts the generosity of God: “hath God said, Ye shall not eat of every tree?” The command was one tree out of many; the question makes it sound like a shortage. Doubt about God’s goodness comes before disobedience.\n\nWhat they want is not fruit. It is to be as gods — to decide good and evil for themselves. And the fruit is genuinely pleasant. Temptation rarely announces itself; it shows up looking reasonable, even beautiful.\n\nThen the sound of God walking, and the question: where art thou? Not because God has lost them, but because they have lost themselves. They hide, and blame, and the world changes shape. Every one of us has a hiding place.',
        reflection_prompts: [
          'What question do you hear that makes God’s generosity look like a shortage?',
          'Where do you hide from God, and what do you use to cover yourself?',
          'How does God’s “where are you?” sound to you today — accusation or invitation?',
        ],
        prayer:
          'Father, I have hidden too. Thank you that you come looking and call me out into the open. Meet me here, and clothe my shame. Amen.',
      },
      {
        title: 'The Call of Abram',
        scripture_reference: 'Genesis 12:1-9',
        scripture_text:
          'Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father’s house, unto a land that I will shew thee: And I will make of thee a great nation, and I will bless thee, and make thy name great; and thou shalt be a blessing: And I will bless them that bless thee, and curse him that curseth thee: and in thee shall all families of the earth be blessed.\n\nSo Abram departed, as the LORD had spoken unto him; and Lot went with him: and Abram was seventy and five years old when he departed out of Haran. And Abram took Sarai his wife, and Lot his brother’s son, and all their substance that they had gathered, and the souls that they had gotten in Haran; and they went forth to go into the land of Canaan; and into the land of Canaan they came.',
        teaching:
          'The story starts over with a command to leave. Leave your country, your kindred, your father’s house — everything that tells you who you are — and go to a land I will show you. Note what is missing: no map, no itinerary, no timeline.\n\nThe promise is enormous. A great nation, a great name, and a blessing so wide that all families of the earth will be caught up in it. God is not rescuing one household for its own sake. He is beginning a rescue for everyone.\n\nAnd Abram goes. Seventy-five years old, no children, no certainty — he departs as the LORD had spoken. That is faith in Genesis: not absolute confidence about the route, but enough trust to pack the bags. The story of the Bible begins with someone walking toward a promise he could not see.',
        reflection_prompts: [
          'What has God asked you to leave behind, maybe a habit or a version of yourself?',
          'Where are you waiting for a map before you will take a step?',
          'How does the promise to bless all families of the earth shape how you read the rest of the Bible?',
        ],
        prayer:
          'God of Abraham, you call people out toward promises they cannot yet see. Give me the courage to go where you send me. Amen.',
      },
    ],
  },
];