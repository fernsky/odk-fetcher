// eslint-disable-next-line @typescript-eslint/no-unused-vars
const data = {
  intro: null,
  audio_monitoring: '1737550865719.m4a',
  enumerator_introduction: {
    enumerator_name: 'Sarbagya Shrestha',
    enumerator_phone: '9823833365',
    enumerator_id: '12345',
    building_token: '12345',
  },
  last_house_token_number: null,
  start_doi: '2025-01-22T18:23:22.560+05:45',
  id: {
    ward_no: 1,
    area_code: '1001',
    house_token_number: '1001',
    fam_symno: '1',
    ask_owner_only: '1',
    doi: '2025-01-22T18:23:22.559+05:45',
    tmp_location: {
      type: 'Point',
      coordinates: [85.3837114, 27.6898248, 1286.300048828125],
      properties: { accuracy: 3.35 },
    },
    location: '27.6898248 85.3837114 1286.300048828125 3.35',
    locality: 'Putladole ',
    dev_org: 'Putladole Tole',
    head_name: 'Trilochan Bhusal',
    head_ph: '9823833355',
    members: { are_a_family: 'yes', total_mem: 2, is_sanitized: 'yes' },
    ewheres: { are_ewhere: 'yes' },
  },
  A: null,
  hh_count: '1',
  hh: {
    h_oship: 'private',
    h_oship_oth: null,
    tmp_is_safe: 'yes',
    is_safe: 'yes',
    wsrc: 'tap_inside_house tap_outside_house tubewell',
    water_src_oth: null,
    water_puri: 'boiling filtering',
    toilet_type: 'flush_with_septic_tank',
    solid_waste: 'home_collection',
    solid_waste_oth: null,
    primary_cf: 'wood',
    primary_es: 'electricity',
    primary_es_oth: null,
    facilitites: 'radio television',
    fem_prop: 'house_only',
    loaned_organization: 'bank finance micro_finance',
    loan_use: 'business_industry agricultural_business real_estate',
    has_bacc: 'bank finance',
    has_insurance: 'health_insurance',
    health_org: 'governmental_health_institution',
    heatlth_org_oth: null,
    income_sources: 'job agriculture',
    municipal_suggestions:
      'road_construction_and_upgradation road_bridge_construction_and_maintenance',
    municipal_suggestions_oth: null,
  },
  family_history_info: {
    NID: null,
    caste: 'chettri',
    caste_oth: null,
    ancestrial_lang: 'nepali',
    ancestrial_lang_oth: null,
    mother_tounge_primary: 'nepali',
    mother_tounge_primary_oth: null,
    religion: 'hindu',
    religion_other: null,
  },
  NED: null,
  education_count: '2',
  NH: null,
  health_count: '2',
  NFT: null,
  fertility_count: '2',
  NDD: null,
  death: {
    has_recent_death: 'yes',
    dno: {
      death_no: 1,
      'death_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/death/dno/death_details",
      death_details: [
        {
          death_enumerator: 'Sarbagya Shrestha',
          death_house_head_name: 'Trilochan Bhusal',
          death_ward_no: '1',
          death_name: 'Rameshor Yadav',
          death_gender: 'male',
          death_age: 80,
          death_cause: 'pneumonia',
          fertile_death_condition: null,
          __id: '4fccc11be63f5f0ce241250bfdeb776e58a6e571',
        },
      ],
    },
  },
  NAR: null,
  absentees_count: '2',
  has_remittance: 'yes',
  remittance_expenses: 'education health household_use',
  NMG: null,
  bp: {
    birth_place: 'same_municipality',
    birth_province: null,
    birth_district: null,
    birth_country: null,
  },
  plocation: {
    prior_location: null,
    prior_province: null,
    prior_district: null,
    prior_country: null,
    residence_reasons: 'other',
    residence_reasons_other: 'Yo bigreko chha ',
  },
  NEA: null,
  economy_count: '2',
  B: null,
  agri_count: '1',
  agri: {
    has_agland: 'yes',
    aglands_oship: 'eilani_parti_khet',
    agricultural_land_count: '1',
    is_farmer: 'yes',
    total_male_farmer: 1,
    total_female_farmer: 1,
    food: {
      fcrops: 'chaite_paddy barse_paddy',
      fcrop_details_count: '2',
      pulses: 'pigeon_pea black_gram',
      pulse_details_count: '2',
      oseeds: 'mustard flax',
      oseed_details_count: '2',
      vtables: 'potato cauliflower',
      vtable_details_count: '2',
      fruits: 'mango',
      fruit_details_count: '1',
      grasses: 'daale_grass',
      dsp: '2025-01-22T18:23:22.559+05:45',
      grasses_ward_no: '1',
      grasses_calc: 'बेसार',
      grasses_enumerator: 'Sarbagya Shrestha',
      grass_area_description: {
        grasses_note: null,
        grass_bigha: 0,
        grass_kattha: 0,
        grass_dhur: 0,
        grass_area: '0',
        grass_area_note: null,
      },
      spices: 'turmeric garlic',
      spice_details_count: '2',
      ccrops: 'betel_nut',
      ccrop_details_count: '1',
      'fcrop_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/food/fcrop_details",
      fcrop_details: [
        {
          dfc: '2025-01-22T18:23:22.559+05:45',
          fcrop_ward_no: '1',
          fcrop: 'चैते धान',
          fcrop_enumerator: 'Sarbagya Shrestha',
          fcrop_house_head_name: 'Trilochan Bhusal',
          fcrop_area_description: {
            frop_note: null,
            fcrop_bigha: 0,
            fcrop_kattha: 0,
            fcrop_dhur: 0,
            fcrop_area: '0',
            fcrop_area_note: null,
          },
          fp: {
            frop_note_prod: null,
            BA01_11: 0,
            BA01_12: 0,
            BA01_13: 0,
            BA01_14: 0,
            fcrop_prod: '0',
          },
          __id: '116b07415eda2686870db25169a848ee4a7e5e82',
        },
        {
          dfc: '2025-01-22T18:43:44.724+05:45',
          fcrop_ward_no: '1',
          fcrop: 'बर्षे धान',
          fcrop_enumerator: 'Sarbagya Shrestha',
          fcrop_house_head_name: 'Trilochan Bhusal',
          fcrop_area_description: {
            frop_note: null,
            fcrop_bigha: 0,
            fcrop_kattha: 0,
            fcrop_dhur: 0,
            fcrop_area: '0',
            fcrop_area_note: null,
          },
          fp: {
            frop_note_prod: null,
            BA01_11: 0,
            BA01_12: 0,
            BA01_13: 0,
            BA01_14: 0,
            fcrop_prod: '0',
          },
          __id: '3c058ab9f1051ef6d746e47a982a62c3a30ee587',
        },
      ],
      'pulse_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/food/pulse_details",
      pulse_details: [
        {
          dpl: '2025-01-22T18:23:22.559+05:45',
          pulse_ward_no: '1',
          pulse: 'रहर',
          pulse_enumerator: 'Sarbagya Shrestha',
          pulse_house_head_name: 'Trilochan Bhusal',
          pulse_area_description: {
            pulse_note: null,
            pulse_bigha: 0,
            pulse_kattha: 0,
            pulse_dhur: 0,
            pulse_area: '0',
            pulse_area_note: null,
          },
          pp: {
            pulses_note_prod: null,
            BA02_11: 0,
            BA02_12: 0,
            BA02_13: 0,
            BA02_14: 0,
            pulse_prod: '0',
          },
          __id: 'c1449b36c40117e0d5fdf362d9cbb8fb0c174a7b',
        },
        {
          dpl: '2025-01-22T18:43:57.938+05:45',
          pulse_ward_no: '1',
          pulse: 'मास',
          pulse_enumerator: 'Sarbagya Shrestha',
          pulse_house_head_name: 'Trilochan Bhusal',
          pulse_area_description: {
            pulse_note: null,
            pulse_bigha: 0,
            pulse_kattha: 0,
            pulse_dhur: 0,
            pulse_area: '0',
            pulse_area_note: null,
          },
          pp: {
            pulses_note_prod: null,
            BA02_11: 0,
            BA02_12: 0,
            BA02_13: 0,
            BA02_14: 0,
            pulse_prod: '0',
          },
          __id: 'e38f35baea0333299078cc85f23d10805432607f',
        },
      ],
      'oseed_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/food/oseed_details",
      oseed_details: [
        {
          dos: '2025-01-22T18:23:22.560+05:45',
          oseed_ward_no: '1',
          oseed: 'तोरी/सरसोँ',
          oseed_enumerator: 'Sarbagya Shrestha',
          oseed_house_head_name: 'Trilochan Bhusal',
          oseed_area_description: {
            oseed_note: null,
            oseed_bigha: 0,
            oseed_kattha: 0,
            oseed_dhur: 0,
            oseed_area: '0',
            oseed_area_note: null,
          },
          oslp: {
            oseed_note_prod: null,
            BA03_11: 0,
            BA03_12: 0,
            BA03_13: 0,
            BA03_14: 0,
            oseed_prod: '0',
          },
          __id: '56bbdb593f3273e12fab044d4428316d3104f34f',
        },
        {
          dos: '2025-01-22T18:44:02.725+05:45',
          oseed_ward_no: '1',
          oseed: 'आलस',
          oseed_enumerator: 'Sarbagya Shrestha',
          oseed_house_head_name: 'Trilochan Bhusal',
          oseed_area_description: {
            oseed_note: null,
            oseed_bigha: 0,
            oseed_kattha: 0,
            oseed_dhur: 0,
            oseed_area: '0',
            oseed_area_note: null,
          },
          oslp: {
            oseed_note_prod: null,
            BA03_11: 0,
            BA03_12: 0,
            BA03_13: 0,
            BA03_14: 0,
            oseed_prod: '0',
          },
          __id: '9202ff8dbf199ae280e64c32ddc8d693d9742864',
        },
      ],
      'vtable_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/food/vtable_details",
      vtable_details: [
        {
          dvt: '2025-01-22T18:23:22.560+05:45',
          vtable_ward_no: '1',
          vtable: 'आलु',
          vtable_enumerator: 'Sarbagya Shrestha',
          vtable_house_head_name: 'Trilochan Bhusal',
          vtables_area_description: {
            vtables_note: null,
            vtables_bigha: 0,
            vtables_kattha: 0,
            vtables_dhur: 0,
            vtables_area: '0',
            vtables_area_note: null,
          },
          vp: {
            vtables_note_prod: null,
            BA04_11: 0,
            BA04_12: 0,
            BA04_13: 0,
            BA04_14: 0,
            vtable_prod: '0',
          },
          __id: 'e50a27ad39276dc0aa22554422966f167007884f',
        },
        {
          dvt: '2025-01-22T18:44:14.462+05:45',
          vtable_ward_no: '1',
          vtable: 'काउली',
          vtable_enumerator: 'Sarbagya Shrestha',
          vtable_house_head_name: 'Trilochan Bhusal',
          vtables_area_description: {
            vtables_note: null,
            vtables_bigha: 0,
            vtables_kattha: 0,
            vtables_dhur: 0,
            vtables_area: '0',
            vtables_area_note: null,
          },
          vp: {
            vtables_note_prod: null,
            BA04_11: 0,
            BA04_12: 0,
            BA04_13: 0,
            BA04_14: 0,
            vtable_prod: '0',
          },
          __id: '9f94fa91c44f58294879db5f5c57365d97da328b',
        },
      ],
      'fruit_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/food/fruit_details",
      fruit_details: [
        {
          dfr: '2025-01-22T18:23:22.559+05:45',
          fruit_ward_no: '1',
          fruit: 'आँप',
          fruit_enumerator: 'Sarbagya Shrestha',
          fruit_house_head_name: 'Trilochan Bhusal',
          fruits_trees_count: 0,
          fruits_area_description: {
            fruits_note: null,
            fruits_bigha: 0,
            fruits_kattha: 0,
            fruits_dhur: 0,
            fruits_area: '0',
            fruits_area_note: null,
          },
          frp: {
            fruits_note_prod: null,
            BA05_11: 0,
            BA05_12: 0,
            BA05_13: 0,
            BA05_14: 0,
            fruit_prod: '0',
          },
          __id: 'e88b2442c4549434ef35b67ee240ef8773610aed',
        },
      ],
      'spice_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/food/spice_details",
      spice_details: [
        {
          dsp: '2025-01-22T18:23:22.559+05:45',
          spice_ward_no: '1',
          spice: 'बेसार',
          spice_enumerator: 'Sarbagya Shrestha',
          spice_house_head_name: 'Trilochan Bhusal',
          spice_area_description: {
            spice_note: null,
            spice_bigha: 0,
            spice_kattha: 0,
            spice_dhur: 0,
            spice_area: '0',
            spice_area_note: null,
          },
          sp: {
            spice_note_prod: null,
            BA06_11: 0,
            BA06_12: 0,
            BA06_13: 0,
            BA06_14: 0,
            spice_prod: '0',
          },
          __id: 'ed0e1850695d58373f85091af0a42e01765dd3fc',
        },
        {
          dsp: '2025-01-22T18:44:41.180+05:45',
          spice_ward_no: '1',
          spice: 'लसुन',
          spice_enumerator: 'Sarbagya Shrestha',
          spice_house_head_name: 'Trilochan Bhusal',
          spice_area_description: {
            spice_note: null,
            spice_bigha: 0,
            spice_kattha: 0,
            spice_dhur: 0,
            spice_area: '0',
            spice_area_note: null,
          },
          sp: {
            spice_note_prod: null,
            BA06_11: 0,
            BA06_12: 0,
            BA06_13: 0,
            BA06_14: 0,
            spice_prod: '0',
          },
          __id: '3e690adff45fc3fa77714ba5e9561567d58b54c6',
        },
      ],
      'ccrop_details@odata.navigationLink':
        "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/food/ccrop_details",
      ccrop_details: [
        {
          dcc: '2025-01-22T18:23:22.560+05:45',
          ccrop_ward_no: '1',
          ccrop: 'सुपारी',
          ccrop_enumerator: 'Sarbagya Shrestha',
          ccrop_house_head_name: 'Trilochan Bhusal',
          isBetel: '1',
          betel_tree_count: 2,
          ccrop_area_description: {
            cash_note: null,
            ccrop_bigha: 0,
            ccrop_kattha: 0,
            ccrop_dhur: 0,
            ccrop_area: '0',
            ccrop_area_note: null,
          },
          cp: {
            cash_note_prod: null,
            BA07_11: 0,
            BA07_12: 0,
            BA07_13: 0,
            BA07_14: 0,
            ccrop_prod: '0',
          },
          __id: '3e02aeb89328874d8ae39940e77e297960a9004c',
        },
      ],
    },
    months_sustained_from_agriculture: 'one_to_three_months',
    has_husbandry: 'yes',
    animals: 'hybird_cow local_cow',
    animal_details_count: '2',
    aprods: 'milk milk_product',
    aprod_details_count: '2',
    has_aquacultured: 'yes',
    aquaculture_details: {
      aquaculture_ward_no: '1',
      pond_no: 1,
      BC01_2: '1',
      BC01_3: 1,
      BC01_4: 0,
      BC01_5: 0,
      BC01_6: 0,
      BC01_7: 0,
      BC01_8: 0,
      pond_area: '6772.63',
      BC01_9: null,
      fish_prod: 66,
    },
    has_apicultured: 'yes',
    apiculture_details: {
      dapi: '2025-01-22T18:23:22.559+05:45',
      apiculture_ward_no: '1',
      hive_no: 2,
      honey_prod: 554,
    },
    months_involved_in_agriculture: 'seven_to_nine_months',
    agri_machines: 'iron_plough power_tiller_mini_tiller tractor',
    'agricultural_land@odata.navigationLink':
      "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/agricultural_land",
    agricultural_land: [
      {
        agland_ward_no: '1',
        agland_oship: 'ऐलानी/पर्ती खेत/ पाखो/बारी',
        agland_enumerator: 'Sarbagya Shrestha',
        agland_house_head_name: 'Trilochan Bhusal',
        land_area: {
          B02_3: 1,
          B02_5: 0,
          B02_7: 0,
          agland_area: '6772.63',
          B02_10: null,
        },
        irrigation_src: 'irrigation_plant',
        irrigation_time: 'three_to_six_months',
        irrigation: {
          B02_13: 1,
          B02_15: 0,
          B02_17: 0,
          irrigated_area: '6772.63',
          B02_20: null,
        },
        __id: '22df5c1c2c63b83b98fbff1a01691a60eb23afdd',
      },
    ],
    'animal_details@odata.navigationLink':
      "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/animal_details",
    animal_details: [
      {
        danim: '2025-01-22T18:23:22.559+05:45',
        animal_ward_no: '1',
        animal: 'ऊन्नत गाई',
        animal_enumerator: 'Sarbagya Shrestha',
        animal_house_head_name: 'Trilochan Bhusal',
        anim: {
          animal_oth: null,
          oth_total_animals: null,
          oth_animal_sales: null,
          oth_animal_revenue: null,
        },
        animn: { total_animals: 2 },
        __id: '1e52e6afb0fcbd8649b2c66470c2bf0b36feb1ed',
      },
      {
        danim: '2025-01-22T18:44:55.412+05:45',
        animal_ward_no: '1',
        animal: 'लोकल गाई',
        animal_enumerator: 'Sarbagya Shrestha',
        animal_house_head_name: 'Trilochan Bhusal',
        anim: {
          animal_oth: null,
          oth_total_animals: null,
          oth_animal_sales: null,
          oth_animal_revenue: null,
        },
        animn: { total_animals: 2 },
        __id: '1a6352c8615bd4fe14a5319c9d601685715855ff',
      },
    ],
    'aprod_details@odata.navigationLink':
      "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/agri/aprod_details",
    aprod_details: [
      {
        daprod: '2025-01-22T18:23:22.560+05:45',
        aprod_ward_no: '1',
        aprod: 'दुध',
        aprod_enumerator: 'Sarbagya Shrestha',
        aprod_house_head_name: 'Trilochan Bhusal',
        apo: {
          aprod_oth: null,
          oth_aprod_unit: null,
          oth_aprod_unit_oth: null,
          oth_aprod_prod: null,
        },
        apon: { aprod_unit: 'litre', aprod_unit_oth: null, aprod_prod: 22 },
        __id: 'de5fb261a5b6b59d4e04cb55ec811fdb28422fca',
      },
      {
        daprod: '2025-01-22T18:45:03.096+05:45',
        aprod_ward_no: '1',
        aprod: 'दुधजन्य वस्तु (ध्यू, चिज, मखन आदि)',
        aprod_enumerator: 'Sarbagya Shrestha',
        aprod_house_head_name: 'Trilochan Bhusal',
        apo: {
          aprod_oth: null,
          oth_aprod_unit: null,
          oth_aprod_unit_oth: null,
          oth_aprod_prod: null,
        },
        apon: {
          aprod_unit: 'kilogram',
          aprod_unit_oth: null,
          aprod_prod: 65,
        },
        __id: '51d0dcc9819b87c3785125af1c00eea75e1e5628',
      },
    ],
  },
  himg: '1737550843713.jpg',
  himg_selfie: '1737550863622.jpg',
  meta: {
    instanceID: 'uuid:7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4',
    instanceName: '1001 Trilochan Bhusal 9823833355',
  },
  __id: 'uuid:7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4',
  __system: {
    submissionDate: '2025-01-22T13:03:19.071Z',
    updatedAt: null,
    submitterId: '25',
    submitterName: 'Tester',
    attachmentsPresent: 3,
    attachmentsExpected: 3,
    status: null,
    reviewState: null,
    deviceId: 'collect:phHfjWB8JF73RTSL',
    edits: 0,
    formVersion: 'Reorder choices',
  },
  'individual@odata.navigationLink':
    "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/individual",
  individual: [
    {
      ind_ward_no: '1',
      dind: '2025-01-22T18:23:22.559+05:45',
      ind_enumerator: 'Sarbagya Shrestha',
      ind_house_head_name: 'Trilochan Bhusal',
      name: 'Trilochan Ji',
      gender: 'male',
      age: 25,
      citizenof: 'nepal',
      citizenof_oth: null,
      individual_history_info: {
        caste_individual: null,
        caste_oth_individual: null,
        ancestrial_lang_individual: null,
        ancestrial_lang_oth_individual: null,
        mother_tounge_primary_individual: null,
        mother_tounge_primary_oth_individual: null,
        religion_individual: null,
        religion_other_individual: null,
      },
      mrd: { marital_status: 'one_marriage', married_age: 22 },
      __id: '52f72b908d79078a44897e1ca7b9429b39a3b4d5',
    },
    {
      ind_ward_no: '1',
      dind: '2025-01-22T18:36:37.907+05:45',
      ind_enumerator: 'Sarbagya Shrestha',
      ind_house_head_name: 'Trilochan Bhusal',
      name: 'Puspa Bhusal',
      gender: 'female',
      age: 30,
      citizenof: 'nepal',
      citizenof_oth: null,
      individual_history_info: {
        caste_individual: null,
        caste_oth_individual: null,
        ancestrial_lang_individual: null,
        ancestrial_lang_oth_individual: null,
        mother_tounge_primary_individual: null,
        mother_tounge_primary_oth_individual: null,
        religion_individual: null,
        religion_other_individual: null,
      },
      mrd: { marital_status: 'one_marriage', married_age: 20 },
      __id: '7173c404cdb1a35f8a4e40165ec2a01a840005a5',
    },
  ],
  'education@odata.navigationLink':
    "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/education",
  education: [
    {
      dedu: '2025-01-22T18:23:22.555+05:45',
      education_ward_no: '1',
      edu_age: '25',
      edu_name: 'Trilochan Ji',
      edu_enumerator: 'Sarbagya Shrestha',
      edu_house_head_name: 'Trilochan Bhusal',
      edd: {
        is_literate: 'both_reading_and_writing',
        edu_level: 'child_development_center',
        primary_sub: null,
      },
      goes_school: 'yes',
      school_barrier: null,
      edt: { has_training: 'no', primary_skill: 'stonework_woodwork' },
      __id: '71b69a88832a06aa2cfcd442bdf76e2af6c7c840',
    },
    {
      dedu: '2025-01-22T18:37:35.280+05:45',
      education_ward_no: '1',
      edu_age: '30',
      edu_name: 'Puspa Bhusal',
      edu_enumerator: 'Sarbagya Shrestha',
      edu_house_head_name: 'Trilochan Bhusal',
      edd: {
        is_literate: 'both_reading_and_writing',
        edu_level: '10',
        primary_sub: null,
      },
      goes_school: null,
      school_barrier: null,
      edt: { has_training: 'no', primary_skill: 'plumbing' },
      __id: '71a4aeaa38b878fb0b762cea9eda0abeb670a1d7',
    },
  ],
  'health@odata.navigationLink':
    "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/health",
  health: [
    {
      dhlth: '2025-01-22T18:23:22.560+05:45',
      health_ward_no: '1',
      health_name: 'Trilochan Ji',
      health_age: '25',
      health_enumerator: 'Sarbagya Shrestha',
      health_house_head_name: 'Trilochan Bhusal',
      chronic: {
        has_chronic_disease: 'yes',
        primary_chronic_disease: 'diabetes kidney_related',
        other_chronic_disease: null,
      },
      is_disabled: 'yes',
      disability: {
        dsbltp: 'cerebral_palsy',
        other_disability_type: null,
        disability_cause: 'conflict',
        other_disability_cause: null,
      },
      __id: 'b7ac301da399c7a5796d6de0f1c058c7ca25885a',
    },
    {
      dhlth: '2025-01-22T18:38:06.115+05:45',
      health_ward_no: '1',
      health_name: 'Puspa Bhusal',
      health_age: '30',
      health_enumerator: 'Sarbagya Shrestha',
      health_house_head_name: 'Trilochan Bhusal',
      chronic: {
        has_chronic_disease: 'no',
        primary_chronic_disease: null,
        other_chronic_disease: null,
      },
      is_disabled: 'no',
      disability: {
        dsbltp: null,
        other_disability_type: null,
        disability_cause: null,
        other_disability_cause: null,
      },
      __id: '76d240ed0a675975931b87ee70ca0bdd794ad371',
    },
  ],
  'fertility@odata.navigationLink':
    "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/fertility",
  fertility: [
    {
      fertility_ward_no: '1',
      fertility_name: 'Trilochan Ji',
      fertility_age: '25',
      fertility_gender: 'male',
      fertility_marital_status: 'one_marriage',
      fertility_enumerator: 'Sarbagya Shrestha',
      fertility_house_head_name: 'Trilochan Bhusal',
      ftd: {
        gave_live_birth: null,
        alive_sons: null,
        alive_daughters: null,
        total_born_children: null,
        NFTBRTH: null,
        has_dead_children: null,
        dead_sons: null,
        dead_daughters: null,
        total_dead_children: null,
        NFTDEAD: null,
        frcb: {
          gave_recent_live_birth: null,
          recent_alive_sons: null,
          recent_alive_daughters: null,
          total_recent_children: null,
          NFTRBRTH: null,
          recent_delivery_location: null,
          prenatal_checkup: null,
        },
        delivery_age: null,
      },
      __id: '90bb720cf2bf37664ee140ce82c9e5134e9faf13',
    },
    {
      fertility_ward_no: '1',
      fertility_name: 'Puspa Bhusal',
      fertility_age: '30',
      fertility_gender: 'female',
      fertility_marital_status: 'one_marriage',
      fertility_enumerator: 'Sarbagya Shrestha',
      fertility_house_head_name: 'Trilochan Bhusal',
      ftd: {
        gave_live_birth: 'yes',
        alive_sons: 2,
        alive_daughters: 1,
        total_born_children: '3',
        NFTBRTH: null,
        has_dead_children: 'yes',
        dead_sons: 1,
        dead_daughters: 0,
        total_dead_children: '1',
        NFTDEAD: null,
        frcb: {
          gave_recent_live_birth: 'yes',
          recent_alive_sons: 1,
          recent_alive_daughters: 1,
          total_recent_children: '2',
          NFTRBRTH: null,
          recent_delivery_location: 'house',
          prenatal_checkup: 10,
        },
        delivery_age: 20,
      },
      __id: 'ff1ad8c1a541a2119bf0007fecb66ac8be59b9ee',
    },
  ],
  'absentees@odata.navigationLink':
    "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/absentees",
  absentees: [
    {
      dabs: '2025-01-22T18:23:22.560+05:45',
      absentees_ward_no: '1',
      abs_name: 'Trilochan Ji',
      abs_gender: 'male',
      abs_prior_edulvl: 'child_development_center',
      abs_prior_age: '25',
      abs_enumerator: 'Sarbagya Shrestha',
      abs_house_head_name: 'Trilochan Bhusal',
      is_absent: 'no',
      abid: {
        abs_age: 22,
        abs_edulvl: 'masters_level',
        ABSPRD: '3',
        absence_reason: 'study',
        abl: {
          abs_location: 'another_country',
          abs_province: null,
          abs_district: null,
          abs_country: 'norway',
          FOREIGN: '1',
        },
        sent_cash: 'sent',
        cash: 200000,
      },
      __id: '5af9536a9c72c71a7d31c17d35d9cf5c890174c6',
    },
    {
      dabs: '2025-01-22T18:39:24.658+05:45',
      absentees_ward_no: '1',
      abs_name: 'Puspa Bhusal',
      abs_gender: 'female',
      abs_prior_edulvl: '10',
      abs_prior_age: '30',
      abs_enumerator: 'Sarbagya Shrestha',
      abs_house_head_name: 'Trilochan Bhusal',
      is_absent: 'yes',
      abid: {
        abs_age: null,
        abs_edulvl: null,
        ABSPRD: null,
        absence_reason: null,
        abl: {
          abs_location: null,
          abs_province: null,
          abs_district: null,
          abs_country: null,
          FOREIGN: null,
        },
        sent_cash: null,
        cash: null,
      },
      __id: '5372a509aee6ea66915e201bf5868e4b07a60502',
    },
  ],
  'economy@odata.navigationLink':
    "Submissions('uuid%3A7a1d0c93-e4ef-4253-9b6f-51dc09c47ac4')/economy",
  economy: [
    {
      deco: '2025-01-22T18:23:22.559+05:45',
      economy_ward_no: '1',
      eco_age: '25',
      eco_name: 'Trilochan Ji',
      eco_enumerator: 'Sarbagya Shrestha',
      eco_house_head_name: 'Trilochan Bhusal',
      ed: {
        m_work: 'less_than_3_months',
        primary_occu: 'non_governmental_job',
        EA02: {
          work_barrier: 'disability_sick',
          work_availability: 'full_time',
        },
      },
      __id: '32a6163d825903e21b4c0fc659f65087501f3a4b',
    },
    {
      deco: '2025-01-22T18:40:58.561+05:45',
      economy_ward_no: '1',
      eco_age: '30',
      eco_name: 'Puspa Bhusal',
      eco_enumerator: 'Sarbagya Shrestha',
      eco_house_head_name: 'Trilochan Bhusal',
      ed: {
        m_work: 'less_than_3_months',
        primary_occu: 'non_governmental_job',
        EA02: { work_barrier: 'family_care', work_availability: 'full_time' },
      },
      __id: 'a84b131977aef28176907ab2e430f19559a731c0',
    },
  ],
};
