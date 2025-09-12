import { Move } from '@/types/moves';

  export const moves: Move[] = [
    {
      id: 1,
      name: 'Jab',
      category: 'Punch',
      description: 'A quick, straight punch thrown with the lead hand. The jab is a versatile punch that can be used to maintain distance, set up combinations, or score points.',
  icon: 'boxing-glove',
  difficulty: 'Beginner'
    },
    {
      id: 2,
      name: 'Cross',
      category: 'Punch',
      description: 'A powerful straight punch thrown with the rear hand. The cross is often thrown after a jab and is one of the most powerful punches.',
  icon: 'boxing-glove',
  difficulty: 'Beginner'
    },
    {
      id: 3,
      name: 'Hook',
      category: 'Punch',
      description: 'A punch thrown in a circular motion, typically targeting the side of the opponent\'s head. Can be thrown with either hand.',
  icon: 'boxing-glove',
  difficulty: 'Beginner'
    },
    {
      id: 4,
      name: 'Uppercut',
      category: 'Punch',
      description: 'A vertical, rising punch thrown with either hand, targeting the chin. Especially effective in close range.',
  icon: 'boxing-glove',
  difficulty: 'Beginner'
    },
    {
      id: 6,
      name: 'Roundhouse Kick',
      category: 'Kick',
      description: 'A powerful kick thrown in a circular motion, typically targeting the legs, body, or head.',
  icon: 'karate',
  difficulty: 'Intermediate'
    },
    {
      id: 7,
      name: 'Horizontal Elbow',
      category: 'Elbow',
      description: 'A horizontal elbow strike typically used in close range, targeting the head or body.',
  icon: 'arm-flex',
  difficulty: 'Beginner'
    },
    {
      id: 8,
      name: 'Vertical Elbow',
      category: 'Elbow',
      description: 'A vertical upward or downward elbow strike used in close combat situations.',
  icon: 'arm-flex',
  difficulty: 'Beginner'
    },
    {
      id: 9,
      name: 'Front Knee',
      category: 'Knee',
      description: 'A straight knee strike typically targeting the midsection or head in the clinch.',
  icon: 'karate',
  difficulty: 'Beginner'
    },
    {
      id: 10,
      name: 'Circular Knee',
      category: 'Knee',
      description: 'A knee strike thrown in a circular motion, often used in the clinch or against the body.',
  icon: 'karate',
  difficulty: 'Intermediate'
    },
    {
      id: 11,
      name: 'Slip',
      category: 'Defense',
      description: 'A defensive head movement where you move your head to either side to avoid straight punches while staying in position to counter.',
  icon: 'shield',
  difficulty: 'Beginner'
    },
    {
      id: 12,
      name: 'Duck',
      category: 'Defense',
      description: 'A defensive movement where you lower your head and upper body under an incoming hook or wide punch.',
  icon: 'shield',
  difficulty: 'Beginner'
    },
    {
      id: 13,
      name: 'Block',
      category: 'Defense',
      description: 'Using your arms and hands to protect against strikes, either by catching them or deflecting their force.',
  icon: 'shield',
  difficulty: 'Beginner'
    },
    {
      id: 14,
      name: 'Parry',
      category: 'Defense',
      description: 'A defensive technique where you redirect an incoming strike by knocking it slightly off course with your hand.',
  icon: 'shield',
  difficulty: 'Intermediate'
    },
    {
      id: 15,
      name: 'Forward Step',
      category: 'Footwork',
      description: 'A basic forward movement while maintaining proper stance, used to close distance and pressure opponents.',
  icon: 'human-handsdown',
  difficulty: 'Beginner'
    },
    {
      id: 16,
      name: 'Lateral Step',
      category: 'Footwork',
      description: 'Moving sideways while maintaining stance, essential for angular attacks and defensive positioning.',
  icon: 'human-handsdown',
  difficulty: 'Beginner'
    },
    {
      id: 17,
      name: 'Pivot',
      category: 'Footwork',
      description: 'Rotating on the ball of your foot to change angles while keeping your stance, crucial for both offense and defense.',
  icon: 'human-handsdown',
  difficulty: 'Intermediate'
    },
    {
      id: 18,
      name: 'Circle Out',
      category: 'Footwork',
      description: 'Moving laterally and backward to escape pressure while maintaining proper distance and stance.',
  icon: 'human-handsdown',
  difficulty: 'Beginner'
    },
    // --- Added extended stand‑up techniques (no ground moves) ---
    {
      id: 19,
      name: 'Overhand',
      category: 'Punch',
      description: 'A looping, powerful rear hand punch that travels over the opponent\'s guard. Setup: Dip slightly to the outside of lead leg, rotate hips & shoulder, whip the arm in an arc. Keep opposite hand tight on defense and re‑chamber quickly.',
  icon: 'boxing-glove',
  difficulty: 'Intermediate'
    },
    {
      id: 22,
      name: 'Superman Punch',
      category: 'Punch',
      description: 'Explosive rear hand punch faked off a kick. Chamber a lead leg feint (as if for a kick), then snap it back while launching forward and extending rear hand straight. Land balanced; avoid overcommitting.',
  icon: 'boxing-glove',
  difficulty: 'Advanced'
    },
    {
      id: 23,
      name: 'Spinning Backfist',
      category: 'Punch',
      description: 'Rotational strike delivered with back of the fist. Step across or pivot, rotate torso spotting target over shoulder, extend arm loosely and connect with forearm/back of fist. Reset stance immediately.',
  icon: 'boxing-glove',
  difficulty: 'Advanced'
    },
    {
      id: 24,
      name: 'Teep (Push Kick)',
      category: 'Kick',
      description: 'Long-range stopping kick. Lift lead knee straight, dorsiflex foot, extend hips to push ball of foot into opponent\'s midsection or thigh. Retract sharply to stance; maintain upright posture.',
  icon: 'karate',
  difficulty: 'Beginner'
    },
    {
      id: 25,
      name: 'Side Kick',
      category: 'Kick',
      description: 'Linear kick delivered with heel. Chamber knee across body, pivot supporting foot, extend leg driving hip through target. Strike with heel, retract and return to stance or step through to angle off.',
  icon: 'karate',
  difficulty: 'Intermediate'
    },
    {
      id: 26,
      name: 'Spinning Back Kick',
      category: 'Kick',
      description: 'Rotational kick thrusting heel backward. Step or pivot, spot target over shoulder, chamber knee tight, drive heel straight back through centerline. Avoid over-rotation; re-center stance on landing.',
  icon: 'karate',
  difficulty: 'Advanced'
    },
    {
      id: 27,
      name: 'Inside Leg Kick',
      category: 'Kick',
      description: 'Low kick targeting inner thigh of lead leg. Turn hip slightly out, whip lower shin into target, foot slightly dorsiflexed. Set up with jab/feints; retract quickly to avoid counters.',
  icon: 'karate',
  difficulty: 'Beginner'
    },
    {
      id: 28,
      name: 'Outside Leg Kick',
      category: 'Kick',
      description: 'Chopping kick to outer thigh (quad). Step out to open angle, rotate hip, strike with lower shin across muscle. Keep hands guarded; finish with pivot or shuffle out of range.',
  icon: 'karate',
  difficulty: 'Beginner'
    },
    {
      id: 29,
      name: 'Oblique Kick',
      category: 'Kick',
      description: 'Stomping kick to opponent\'s front thigh/knee area (above joint for safety). Chamber knee, extend heel downward/forward to post or disrupt forward movement. Maintain guard and balance.',
  icon: 'karate',
  difficulty: 'Intermediate'
    },
    {
      id: 30,
      name: 'Axe Kick',
      category: 'Kick',
      description: 'Vertical downward kick. Lift leg high with extended knee, then drop heel sharply onto target line (head/shoulder/guard). Slightly flex supporting knee to absorb impact; retract under control.',
  icon: 'karate',
  difficulty: 'Advanced'
    },
    {
      id: 31,
      name: 'Spinning Elbow',
      category: 'Elbow',
      description: 'Rotational elbow strike. Step across (or pivot), rotate torso while keeping chin tucked, whip rear (or lead) elbow horizontally through target. Follow through minimally to stay balanced.',
  icon: 'arm-flex',
  difficulty: 'Advanced'
    },
    {
      id: 32,
      name: 'Upward Elbow',
      category: 'Elbow',
      description: 'Close-range vertical elbow traveling upward between opponent\'s guard. Sink knees slightly, drive elbow up with hip & shoulder, palm facing inward. Ideal after a level change or clinch break.',
  icon: 'arm-flex',
  difficulty: 'Intermediate'
    },
    {
      id: 33,
      name: 'Check (Leg Kick Defense)',
      category: 'Defense',
      description: 'Defensive lift of lead leg to block low kicks with shin. Turn knee outward, raise leg just enough to meet kick, keep hands high. Land back into stance ready to counter (cross or teep).',
  icon: 'shield',
  difficulty: 'Beginner'
    },
    {
      id: 34,
      name: 'Shoulder Roll',
      category: 'Defense',
      description: 'Deflection of straight/right hand shots by rotating lead shoulder up and in while tucking chin. Rear hand ready to parry or counter. Reset posture—do not over-rotate exposing body.',
  icon: 'shield',
  difficulty: 'Intermediate'
    },
    {
      id: 35,
      name: 'High Guard',
      category: 'Defense',
      description: 'Tight two-hand guard absorbing or deflecting strikes. Elbows in, forearms vertical, chin tucked. Rotate torso & subtly angle gloves to redirect impact; look through eyebrows to maintain vision.',
  icon: 'shield',
  difficulty: 'Beginner'
    }
  ] as const;