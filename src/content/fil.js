/*
 * Kapareho ng en.js ang hugis: bawat item ay may id, difficulty, material,
 * correctAnswer, technique, explanation, at fabricated. Ang sagot ay hiwalay
 * sa material upang hindi ito maisama sa public snapshot bago ang reveal.
 *
 * Ang chainOfCustody ang opsiyonal na bonus round. Nasa material ang orihinal
 * na pahayag at apat na muling pagsasalaysay sa pagkakasunod na ipinapakita sa
 * screen, may maikling tala kung ano ang nabago sa bawat hakbang. Nasa
 * correctAnswer ang tamang pagkakasunod mula pinakauna hanggang pinakahuli.
 */

export const filipinoContent = {
  locale: 'fil',
  rounds: {
    oddSourceOut: [
      {
        id: 'odd-bridge-01',
        difficulty: 'easy',
        material: {
          event: 'Nagbukas ang lungsod ng bagong tulay para sa mga naglalakad',
          sources: [
            { id: 'a', label: 'A', source: 'Pagsusuri sa Disenyong Sibiko', headline: 'Ipinapakita ng unang datos ang bahagyang pagdami ng naglalakad malapit sa bagong tawiran' },
            { id: 'b', label: 'B', source: 'Ang Araw-araw na Megaphone', headline: 'BINAGO NG TULAY ANG LAHAT AT AYAW SABIHIN NG MGA OPISYAL KUNG BAKIT' },
            { id: 'c', label: 'C', source: 'Balitang Pantalan', headline: 'Binuksan ang tulay sa tabing-ilog matapos ang inspeksiyon sa kaligtasan' },
            { id: 'd', label: 'D', source: 'Ang Bahagyang Baluktot na Balita', headline: 'Humingi umano ng karapatang maningil ang mga kalapati sa bagong tulay' },
          ],
        },
        correctAnswer: 'b',
        technique: 'Walang pinangalanang sanggunian',
        explanation: 'Walang binanggit na sanggunian, petsa, pag-aaral, o opisyal na maaaring beripikahin.',
        fabricated: true,
      },
      {
        id: 'odd-library-02',
        difficulty: 'medium',
        material: {
          event: 'Pinalawig ng aklatan ang oras nito tuwing weekend',
          sources: [
            { id: 'a', label: 'A', source: 'Talaang Serbisyong Pampubliko', headline: 'Maaaring dumami ang bumibisita sa weekend, ngunit kailangan pa ng mas mahabang obserbasyon' },
            { id: 'b', label: 'B', source: 'Talaan ng Bayan', headline: 'Magbubukas na rin tuwing Linggo ang sentrong aklatan simula Mayo 4' },
            { id: 'c', label: 'C', source: 'Sulo ng Katotohanan Online', headline: 'GUSTO NILANG NASA LOOB KA BUONG WEEKEND. TANUNGIN MO KUNG BAKIT.' },
            { id: 'd', label: 'D', source: 'Ang Papel na Pananda', headline: 'Masayang-masaya raw ang mga aklat na nawala ang nag-iisa nilang tahimik na araw' },
          ],
        },
        correctAnswer: 'c',
        technique: 'Emosyonal na pagbalangkas',
        explanation: 'Hinala at malalaking titik ang ipinalit sa ebidensiyang maaaring suriin.',
        fabricated: true,
      },
      {
        id: 'odd-garden-03',
        difficulty: 'hard',
        material: {
          event: 'Nagtanim ang isang paaralan ng gulayan',
          sources: [
            { id: 'a', label: 'A', source: 'Mga Tala sa Pananaliksik sa Pagkatuto', headline: 'May ugnayan ang maliliit na programang gulayan at pakikilahok, ngunit hindi nito pinatutunayan ang mas mataas na marka' },
            { id: 'b', label: 'B', source: 'Mesa ng Edukasyon', headline: 'Binuksan ng Paaralang Northfield ang gulayang panturo noong Setyembre 12' },
            { id: 'c', label: 'C', source: 'Mga Sikreto ng Paaralan na Walang Salà', headline: 'IBINUNYAG: BABAGUHIN NG GULAYAN ANG BAWAT BATA SA ISANG GABI' },
            { id: 'd', label: 'D', source: 'Ang Araw-araw na Pala', headline: 'Maagang nagpatala ang mga karot matapos luwagan ang patakaran sa ugat' },
          ],
        },
        correctAnswer: 'c',
        technique: 'Katiyakang hindi mapatunayan',
        explanation: 'Nagbibigay ito ng napakalawak na pangako nang walang ebidensiya, pinagmulan, o malinaw na sukatan ng tagumpay.',
        fabricated: true,
      },
    ],
    spinDoctor: [
      {
        id: 'spin-commute-01',
        difficulty: 'easy',
        material: { phrases: ['Ayon sa bagong survey', 'galit na galit ang mga commuter', 'dahil sa napakaliit na dagdag-pasahe', 'batay sa 42 online na sagot'] },
        correctAnswer: [1, 2, 3],
        technique: 'Mapanulsol na salita at mahinang sample',
        explanation: 'Itinutulak ng “galit na galit” ang emosyon, hinuhusgahan ng “napakaliit” ang pagbabago, at maaaring hindi kumatawan sa lahat ang 42 online na sagot.',
        fabricated: true,
      },
      {
        id: 'spin-lunch-02',
        difficulty: 'medium',
        material: { phrases: ['Sang-ayon ang mga eksperto', 'na tagumpay ang bagong menu', 'matapos tumaas nang 18 porsiyento ang benta', 'sa unang linggo nito'] },
        correctAnswer: [0, 1, 3],
        technique: 'Kulang ang pinagmulan at konteksto',
        explanation: 'Hindi pinangalanan ang mga eksperto, opinyon ang “tagumpay,” at kulang ang isang linggo upang makita ang buong konteksto.',
        fabricated: true,
      },
      {
        id: 'spin-park-03',
        difficulty: 'hard',
        material: { phrases: ['Binatikos ng mga kritiko', 'ang matapang na plano sa parke', 'kahit suportado ito ng karamihan', 'sa isang survey sa isang barangay'] },
        correctAnswer: [0, 1, 3],
        technique: 'Mapanulsol na salita at piling ebidensiya',
        explanation: 'Ginagabayan ng “binatikos” at “matapang” ang mambabasa, at hindi maaaring katawanin ng isang survey sa isang lugar ang lahat ng residente.',
        fabricated: true,
      },
    ],
    realOrRendered: [
      {
        id: 'render-market-01', difficulty: 'easy',
        material: { kind: 'image-description', prompt: 'Larawan ng palengke kung saan magulo at hindi mabasa ang mga titik sa nakasabit na karatula.' },
        correctAnswer: 'rendered', technique: 'Magulong teksto',
        explanation: 'Madalas magmukhang mga titik ang teksto sa generated image ngunit hindi ito bumubuo ng malinaw na salita.', fabricated: true,
      },
      {
        id: 'render-notice-02', difficulty: 'medium',
        material: { kind: 'text', prompt: 'Isang abiso ng konseho na may pangalan ng tanggapan, petsa, reference number, at gumaganang paraan ng pakikipag-ugnayan.' },
        correctAnswer: 'real', technique: 'Mga detalyeng mabeberipika',
        explanation: 'Nagbibigay ang mga tiyak na detalye ng maraming paraan upang suriin kung saan nagmula ang abiso.', fabricated: true,
      },
      {
        id: 'render-station-03', difficulty: 'hard',
        material: { kind: 'image-description', prompt: 'Isang mataong estasyon kung saan pareho ang disenyo ng scarf ng anim na hindi magkakakilalang tao.' },
        correctAnswer: 'rendered', technique: 'Paulit-ulit na detalye sa likuran',
        explanation: 'Maaaring ulitin ng sintetikong larawan ang mga texture o bagay na karaniwang magkakaiba sa totoong grupo ng tao.', fabricated: true,
      },
      {
        id: 'render-portrait-04', difficulty: 'medium',
        material: { kind: 'image-description', prompt: 'Isang portrait kung saan may anim na daliri ang isang kamay at humahalo sa pulso ang bracelet.' },
        correctAnswer: 'rendered', technique: 'Hindi tugmang anatomiya',
        explanation: 'Ang sobrang daliri at bagay na tila humahalo sa balat ay malalakas na palatandaan ng sintetikong larawan.', fabricated: true,
      },
      {
        id: 'render-report-05', difficulty: 'hard',
        material: { kind: 'text', prompt: 'Isang maikling ulat na pinangalanan ang dataset, nagbigay ng link, sinabi ang laki ng sample, at ipinaliwanag ang limitasyon.' },
        correctAnswer: 'real', technique: 'Nasusuring pinagmulan',
        explanation: 'Ang pinangalanang dataset, paraan, at limitasyon ay nagbibigay ng mga tiyak na pahayag na maaaring beripikahin.', fabricated: true,
      },
    ],
    chainOfCustody: [
      {
        id: 'chain-bus-01',
        difficulty: 'easy',
        material: {
          claim: 'Tinanong ng tanggapan ng transportasyon ang 300 pasahero tungkol sa iskedyul.',
          retellings: [
            { id: 'a', label: 'A', text: 'Iginigiit ng mga pasahero na patagalin ang huling biyahe.', note: 'Nawala ang bilang at naging paggigiit ang dating hiling.' },
            { id: 'b', label: 'B', text: 'Sa survey ng tanggapan sa 300 pasahero, 6 sa 10 ang gustong patagalin ang huling biyahe.', note: 'May pangalan ng pinagmulan, laki ng sample, at nasukat na resulta.' },
            { id: 'c', label: 'C', text: 'GALIT NA GALIT ANG LAHAT SA MAAGANG HULING BIYAHE.', note: 'Naging lahat ang 6 sa 10, at naging galit ang dating hiling.' },
            { id: 'd', label: 'D', text: 'Ayon sa survey, gusto ng karamihan na patagalin ang huling biyahe.', note: 'Nawala ang tanggapan at ang laki ng sample.' },
          ],
        },
        correctAnswer: ['b', 'd', 'a', 'c'],
        technique: 'Nawawalang detalye at paglaki ng pahayag',
        explanation: 'Bawat pagsasalaysay ay nagtatanggal ng detalyeng masusuri at nagdaragdag ng mas malakas na damdamin, hanggang maging sigaw ang isang nasukat na resulta.',
        fabricated: true,
      },
      {
        id: 'chain-clinic-02',
        difficulty: 'medium',
        material: {
          claim: 'Inilathala ng klinika ang oras ng paghihintay nito sa mga buwan ng taglamig.',
          retellings: [
            { id: 'a', label: 'A', text: 'Dumoble na ang paghihintay sa klinika.', note: 'Ang pagbabago sa tatlong buwan ay isinalaysay na parang panghabambuhay.' },
            { id: 'b', label: 'B', text: 'Ayon sa klinika, tumaas ang paghihintay mula 9 tungo sa 18 minuto mula Disyembre hanggang Pebrero.', note: 'May pinagmulan, parehong bilang, at saklaw na panahon.' },
            { id: 'c', label: 'C', text: 'Dumoble ang paghihintay sa klinika nitong taglamig.', note: 'Nawala ang panimulang bilang, natira ang salitang dumoble.' },
            { id: 'd', label: 'D', text: 'WALA NANG LIGTAS SA KLINIKANG IYAN.', note: 'Ang siyam na minutong dagdag ay isinalaysay na parang panganib sa lahat.' },
          ],
        },
        correctAnswer: ['b', 'c', 'a', 'd'],
        technique: 'Kulang na konteksto at palaking pahayag',
        explanation: 'Kapag nawala ang panimulang bilang at ang panahon, nagdadala ng mas malaking kahulugan ang maliit na nasukat na pagtaas.',
        fabricated: true,
      },
      {
        id: 'chain-reading-03',
        difficulty: 'hard',
        material: {
          claim: 'Ibinahagi ng paaralan sa mga magulang ang isang taong resulta sa pagbasa.',
          retellings: [
            { id: 'a', label: 'A', text: 'Natuklasan ng paaralan na tumaas nang 4 porsiyento ang marka sa pagbasa ng isang baitang matapos ang oras ng pagbasa.', note: 'Isang baitang, isang taon, at ang laki ng pagbabago.' },
            { id: 'b', label: 'B', text: 'PATUNAY: ISANG ORAS ARAW-ARAW AY SAPAT NA SA KAHIT SINONG BATA.', note: 'Ang resulta ng isang paaralan ay ginawang patunay para sa bawat bata.' },
            { id: 'c', label: 'C', text: 'Umuubra ang oras ng pagbasa, ulat ng mga paaralan.', note: 'Naging mga paaralan ang isang paaralan, at naging hatol ang dating ugnayan.' },
            { id: 'd', label: 'D', text: 'Itinaas ng oras ng pagbasa ang marka sa isang paaralan.', note: 'Tahimik na nawala ang baitang at ang 4 porsiyento.' },
          ],
        },
        correctAnswer: ['a', 'd', 'c', 'b'],
        technique: 'Palawak na saklaw',
        explanation: 'Bawat hakbang ay nagpapalawak kung sino ang saklaw ng pahayag, mula isang baitang tungo sa bawat bata, nang walang bagong ebidensiya.',
        fabricated: true,
      },
    ],
  },
}

export default filipinoContent
