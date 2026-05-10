import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Song from '../models/Song';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const songs = [
  { name: 'Birds in the City', url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Atmo_%E2%80%93_V%C3%B6gel%2C_Stadt.mp3' },
  { name: 'Shore Waves', url: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Atmo_%E2%80%93_Ufer_Wellen.mp3' },
  { name: 'Birds Standard', url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Atmo_%E2%80%93_V%C3%B6gel_Standard.mp3' },
  { name: 'Birds Summer', url: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Atmo_%E2%80%93_V%C3%B6gel_sommerlich.mp3' },
  { name: 'Forest with Crows, Winter', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Waldatmo_mit_Kr%C3%A4hen%2C_Winter.mp3' },
  { name: 'Rain in Woods', url: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Bourne_woods_rain_2020-05-10_0800.mp3' },
  { name: 'Forest Elaenia Bird', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Myiopagis_gaimardii_-_Forest_Elaenia_XC249981.mp3' },
  { name: 'Barred Forest Falcon', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Micrastur_ruficollis_-_Barred_Forest_Falcon_XC251118.mp3' },
  { name: 'Thunder (Antti Luode)', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Thunder_%28Antti_Luode%29.mp3' },
  { name: 'River Flowing (Gravity Sound)', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/River_flowing_%28Gravity_Sound%29.mp3' },
  { name: 'Rain & Thunder', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Lluvia_y_truenos_desde_la_ventana_01.mp3' },
  { name: 'Birdsong and Rain', url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Bourne_woods_Birdsong_and_rain_2020-06-17_0742.mp3' },
  { name: 'Rain (Antti Luode)', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Rain_%28Antti_Luode%29.mp3' },
  { name: 'Fall Rain', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Fall_Rain_%28Antti_Luode%29.mp3' },
  { name: 'Rain Rain Rain', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Rain_Rain_Rain_%28Antti_Luode%29.mp3' },
  { name: 'Southfork in Rain', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Southfork_in_Rain_%28Antti_Luode%29.mp3' },
  { name: 'Atmo Forest Birds 1', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Atmo_%E2%80%93_V%C3%B6gel_1.mp3' },
  { name: 'Atmo Forest Birds 2', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Atmo_%E2%80%93_V%C3%B6gel_2.mp3' },
  { name: 'Nature Soundscape', url: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Sonus_naturalis_-_Soundscape_XC471087.mp3' },
  { name: 'Wood Thrush', url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Hylocichla_mustelina_-_Wood_Thrush_XC463748.mp3' },
  { name: 'Wood Duck', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Aix_sponsa_-_Wood_Duck_XC177728.mp3' },
  { name: 'Superb Starling', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Lamprotornis_superbus_-_Superb_Starling_XC402690.mp3' },
  { name: 'Common Moorhen', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Gallinula_chloropus_-_Common_Moorhen_XC471079.mp3' },
  { name: 'Eurasian Hobby', url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Falco_subbuteo_-_Eurasian_Hobby_XC469763.mp3' },
  { name: 'Chinspot Batis', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Batis_molitor_-_Chinspot_Batis_XC370984.mp3' },
  { name: 'Singing Cisticola', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Cisticola_cantans_-_Singing_Cisticola_XC366835.mp3' },
  { name: 'Noisy Miner', url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Manorina_melanocephala_-_Noisy_Miner_XC459075.mp3' },
  { name: 'White-browed Sparrow-Weaver', url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Plocepasser_mahali_-_White-browed_Sparrow-Weaver_XC367175.mp3' },
  { name: 'Stellers Jay', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Cyanocitta_stelleri_-_Steller%27s_Jay_XC110261.mp3' },
  { name: 'American Crow', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Corvus_brachyrhynchos_-_American_Crow_XC110263.mp3' },
  { name: 'Wood Thrush Var 2', url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Hylocichla_mustelina_-_Wood_Thrush_XC178133.mp3' },
  { name: 'Wood Thrush Var 3', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Hylocichla_mustelina_-_Wood_Thrush_XC178127.mp3' },
  { name: 'Wood Thrush Var 4', url: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Hylocichla_mustelina_-_Wood_Thrush_XC311811.mp3' },
  { name: 'European Golden Plover', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Pluvialis_apricaria_-_European_Golden_Plover_XC471077.mp3' }
];


const seedSongs = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const songData of songs) {
      const exists = await Song.findOne({ url: songData.url });
      if (!exists) {
        await Song.create(songData);
        console.log(`Added: ${songData.name}`);
      } else {
        console.log(`Skipped (already exists): ${songData.name}`);
      }
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding songs:', error);
    process.exit(1);
  }
};

seedSongs();
