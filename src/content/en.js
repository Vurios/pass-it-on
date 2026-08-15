/*
 * Content shape: each round item has id, difficulty, material, correctAnswer,
 * technique, explanation, and fabricated. Material contains only what that
 * round renders; correctAnswer stays separate so future public snapshots can omit it.
 *
 * chainOfCustody is the optional bonus round. Its material holds the original
 * claim and four retellings in the shuffled order the screen shows them, each
 * with a short note naming what changed at that step. correctAnswer lists the
 * retelling ids from earliest to latest.
 */

export const englishContent = {
  locale: 'en',
  rounds: {
    oddSourceOut: [
      {
        id: 'odd-bridge-01',
        difficulty: 'easy',
        material: {
          event: 'A city opens a new pedestrian bridge',
          sources: [
            { id: 'a', label: 'A', source: 'Civic Design Review', headline: 'Early footfall data suggests modest gains near the new crossing' },
            { id: 'b', label: 'B', source: 'The Daily Megaphone', headline: 'BRIDGE CHANGES EVERYTHING AND OFFICIALS WILL NOT TELL YOU WHY' },
            { id: 'c', label: 'C', source: 'Harbour News', headline: 'Riverside footbridge opens after council safety inspection' },
            { id: 'd', label: 'D', source: 'The Slightly Bent Times', headline: 'Pigeons demand toll rights after bridge opens without consultation' },
          ],
        },
        correctAnswer: 'b',
        technique: 'Missing attribution',
        explanation: 'The claim names no source, date, study, or official who could be checked.',
        fabricated: true,
      },
      {
        id: 'odd-library-02',
        difficulty: 'medium',
        material: {
          event: 'A library extends its weekend hours',
          sources: [
            { id: 'a', label: 'A', source: 'Public Services Quarterly', headline: 'Weekend access may improve attendance, though longer observation is needed' },
            { id: 'b', label: 'B', source: 'Town Record', headline: 'Central library adds Sunday hours from 4 May' },
            { id: 'c', label: 'C', source: 'Truth Torch Online', headline: 'THEY WANT YOU INSIDE ALL WEEKEND. ASK YOURSELF WHY.' },
            { id: 'd', label: 'D', source: 'The Paper Bookmark', headline: 'Books reportedly thrilled to lose their only quiet day' },
          ],
        },
        correctAnswer: 'c',
        technique: 'Emotional framing',
        explanation: 'The post substitutes suspicion and capital letters for evidence someone could verify.',
        fabricated: true,
      },
      {
        id: 'odd-garden-03',
        difficulty: 'hard',
        material: {
          event: 'A school plants a vegetable garden',
          sources: [
            { id: 'a', label: 'A', source: 'Learning Research Notes', headline: 'Small garden programmes correlate with engagement but do not prove wider attainment gains' },
            { id: 'b', label: 'B', source: 'Education Desk', headline: 'Northfield School opens teaching garden, 12 September' },
            { id: 'c', label: 'C', source: 'Unfiltered School Secrets', headline: 'EXPOSED: VEGETABLE PLOT WILL TRANSFORM EVERY CHILD OVERNIGHT' },
            { id: 'd', label: 'D', source: 'The Daily Trowel', headline: 'Carrots enrol early after school lowers roots requirement' },
          ],
        },
        correctAnswer: 'c',
        technique: 'Unverifiable certainty',
        explanation: 'A sweeping promise is presented without evidence, attribution, or a measurable definition of success.',
        fabricated: true,
      },
    ],
    spinDoctor: [
      {
        id: 'spin-commute-01',
        difficulty: 'easy',
        material: {
          phrases: ['New survey finds', 'commuters are furious', 'after a tiny fare change', 'according to 42 online replies'],
        },
        correctAnswer: [1, 2, 3],
        technique: 'Loaded language and weak sample',
        explanation: '“Furious” pushes emotion, while “tiny” judges the change and 42 online replies may not represent commuters.',
        fabricated: true,
      },
      {
        id: 'spin-lunch-02',
        difficulty: 'medium',
        material: {
          phrases: ['Experts agree', 'the new lunch menu is a triumph', 'after sales rose 18 percent', 'during opening week'],
        },
        correctAnswer: [0, 1, 3],
        technique: 'Missing attribution and context',
        explanation: 'The experts are unnamed, “triumph” is a judgement, and one opening week gives too little context.',
        fabricated: true,
      },
      {
        id: 'spin-park-03',
        difficulty: 'hard',
        material: {
          phrases: ['Critics attack', 'the bold park plan', 'despite most residents supporting it', 'in one neighbourhood poll'],
        },
        correctAnswer: [0, 1, 3],
        technique: 'Loaded language and cherry-picked evidence',
        explanation: '“Attack” and “bold” steer the reader, while one neighbourhood poll cannot stand for every resident.',
        fabricated: true,
      },
    ],
    realOrRendered: [
      {
        id: 'render-market-01',
        difficulty: 'easy',
        material: { kind: 'image-description', prompt: 'A market photograph where a hanging shop sign contains tangled, unreadable letters.' },
        correctAnswer: 'rendered',
        technique: 'Garbled text',
        explanation: 'Text inside generated images often looks letter-like without forming stable words.',
        fabricated: true,
      },
      {
        id: 'render-notice-02',
        difficulty: 'medium',
        material: { kind: 'text', prompt: 'A council notice gives a department name, publication date, reference number, and a working contact route.' },
        correctAnswer: 'real',
        technique: 'Verifiable specifics',
        explanation: 'Concrete details provide several independent paths for checking where the notice came from.',
        fabricated: true,
      },
      {
        id: 'render-station-03',
        difficulty: 'hard',
        material: { kind: 'image-description', prompt: 'A station crowd where the same scarf pattern repeats on six unrelated people.' },
        correctAnswer: 'rendered',
        technique: 'Repeating background detail',
        explanation: 'Synthetic scenes can repeat textures or objects where a real crowd would vary naturally.',
        fabricated: true,
      },
      {
        id: 'render-portrait-04',
        difficulty: 'medium',
        material: { kind: 'image-description', prompt: 'A portrait where one hand has six fingers and a bracelet merges into the wrist.' },
        correctAnswer: 'rendered',
        technique: 'Anatomy mismatch',
        explanation: 'Extra fingers and objects melting into skin are strong signs that an image was synthesised.',
        fabricated: true,
      },
      {
        id: 'render-report-05',
        difficulty: 'hard',
        material: { kind: 'text', prompt: 'A short report names its dataset, links to the source, states its sample size, and explains a limitation.' },
        correctAnswer: 'real',
        technique: 'Checkable sourcing',
        explanation: 'A named dataset, method, and limitation give a reader concrete claims to verify.',
        fabricated: true,
      },
    ],
    chainOfCustody: [
      {
        id: 'chain-bus-01',
        difficulty: 'easy',
        material: {
          claim: 'A transport office asks 300 riders about the timetable.',
          retellings: [
            { id: 'a', label: 'A', text: 'Riders are demanding a later last bus.', note: 'The number goes. A want becomes a demand.' },
            { id: 'b', label: 'B', text: 'A transport office survey of 300 riders found 6 in 10 want a later last bus.', note: 'Named source, sample size, measured finding.' },
            { id: 'c', label: 'C', text: 'EVERYONE IS FURIOUS THE LAST BUS IS SO EARLY.', note: 'Six in ten is now everyone. Wanting is now fury.' },
            { id: 'd', label: 'D', text: 'A survey says most riders want a later last bus.', note: 'The office and the sample size drop away.' },
          ],
        },
        correctAnswer: ['b', 'd', 'a', 'c'],
        technique: 'Detail loss and escalation',
        explanation: 'Each retelling drops a checkable detail and adds a stronger feeling, until a measured finding sounds like an outcry.',
        fabricated: true,
      },
      {
        id: 'chain-clinic-02',
        difficulty: 'medium',
        material: {
          claim: 'A clinic publishes its waiting times for the winter months.',
          retellings: [
            { id: 'a', label: 'A', text: 'Waiting at the clinic has doubled.', note: 'A three month change becomes permanent.' },
            { id: 'b', label: 'B', text: 'The clinic says waiting rose from 9 to 18 minutes between December and February.', note: 'Named source, both numbers, the period covered.' },
            { id: 'c', label: 'C', text: 'Waiting at the clinic doubled over the winter.', note: 'The starting number goes. Only doubled remains.' },
            { id: 'd', label: 'D', text: 'NOBODY IS SAFE AT THAT CLINIC ANY MORE.', note: 'Nine minutes becomes a danger to everyone.' },
          ],
        },
        correctAnswer: ['b', 'c', 'a', 'd'],
        technique: 'Missing context and inflation',
        explanation: 'Dropping the starting number and the season lets a small measured rise carry a much larger meaning.',
        fabricated: true,
      },
      {
        id: 'chain-reading-03',
        difficulty: 'hard',
        material: {
          claim: 'A school shares one year of reading results with parents.',
          retellings: [
            { id: 'a', label: 'A', text: 'A school found reading scores rose 4 percent in one year group after a reading hour.', note: 'One year group, one year, one number.' },
            { id: 'b', label: 'B', text: 'PROOF: ONE HOUR A DAY FIXES ANY CHILD.', note: 'One school, retold as every child.' },
            { id: 'c', label: 'C', text: 'Reading hours are working, schools report.', note: 'One school becomes schools. A link becomes a verdict.' },
            { id: 'd', label: 'D', text: 'A reading hour lifted scores at a school.', note: 'The year group and the 4 percent disappear.' },
          ],
        },
        correctAnswer: ['a', 'd', 'c', 'b'],
        technique: 'Scope creep',
        explanation: 'Each step widens who the claim covers, from one year group to every child, with no new evidence.',
        fabricated: true,
      },
    ],
  },
}

export default englishContent
