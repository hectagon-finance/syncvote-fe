const { supabase } = require('../configs/supabaseClient');
const { Mission } = require('../models/Mission');
const { insertCheckpoint } = require('./CheckpointService');
async function getAllMission() {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase.from('mission').select('*');

      if (!error) {
        let missions = [];
        data.map((m) => {
          missions.push(
            new Mission(m.id, m.owner_id, m.status, m.current_vote_data_id)
          );
        });
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: missions,
        });
      } else {
        resolve({
          status: 'ERR',
          massage: 'Cannot get all mission',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function insertMission(props) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data: newMission, error } = await supabase
        .from('mission')
        .insert(props)
        .select('*');

      if (!error) {
        if (newMission[0].status === 'PUBLIC') {
          newMission[0].data.checkpoints.map(async (checkpoint) => {
            const checkpointData = {
              id: `${newMission[0].id}-${checkpoint.id}`,
              vote_machine_type: checkpoint.vote_machine_type,
              mission_id: newMission[0].id,
              title: checkpoint.title,
              docs: checkpoint.docs,
              participation: checkpoint?.participation,
              quorum: 60,
              options: checkpoint.data?.options,
              delays: checkpoint?.delays,
              delayUnits: checkpoint?.delayUnits,
              duration: checkpoint?.duration,
              children: checkpoint?.children,
            };

            const error = await insertCheckpoint(checkpointData);
            if (error) {
              resolve({
                status: 'ERR',
                message: error,
              });
            }
          });
        }
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: newMission,
        });
      } else {
        resolve({
          status: 'ERR',
          message: error,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function updateMission(props) {
  return new Promise(async (resolve, reject) => {
    try {
      const { params, missionId } = props;

      const { data: updateMission, error } = await supabase
        .from('mission')
        .update(params)
        .eq('id', missionId)
        .select('*');

      if (!error) {
        if (updateMission[0].status === 'PUBLIC') {
          updateMission[0].data.checkpoints.map(async (checkpoint) => {
            const checkpointData = {
              id: `${updateMission[0].id}-${checkpoint.id}`,
              vote_machine_type: checkpoint.vote_machine_type,
              mission_id: updateMission[0].id,
              title: checkpoint.title,
              docs: checkpoint.docs,
              participation: checkpoint?.participation,
              quorum: 60,
              options: checkpoint.data?.options,
              delays: checkpoint?.delays,
              delayUnits: checkpoint?.delayUnits,
              duration: checkpoint?.duration,
              children: checkpoint?.children,
            };

            const error = await insertCheckpoint(checkpointData);
            if (error) {
              resolve({
                status: 'ERR',
                message: error,
              });
            }
          });
        }

        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: updateMission,
        });
      } else {
        resolve({
          status: 'ERR',
          message: error,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

// async function getAMision(props) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const { missionId } = props;
//       const { data: newMission, error } = await supabase
//         .from('mission')
//         .select('*')
//         .eq('id', missionId);

//       if (!error) {
//         if (newMission[0].status === 'PUBLIC') {
//           newMission[0].data.checkpoints.map(async (checkpoint) => {
//             const checkpointData = {
//               id: `${newMission[0].id}-${checkpoint.id}`,
//               vote_machine_type: checkpoint.vote_machine_type,
//               title: checkpoint.title,
//               docs: checkpoint.docs,
//               mission_id: newMission[0].id,
//               participation: checkpoint?.participation,
//               quorum: 60,
//               options: checkpoint.data?.options,
//               delays: checkpoint?.delays,
//               delayUnits: checkpoint?.delayUnits,
//               duration: checkpoint?.duration,
//               children: checkpoint?.children,
//             };

//             const error = await insertCheckpoint(checkpointData);
//             if (error) {
//               resolve({
//                 status: 'ERR',
//                 message: error,
//               });
//             }
//           });
//         }
//         resolve({
//           status: 'OK',
//           message: 'SUCCESS',
//           data: newMission,
//         });
//       } else {
//         resolve({
//           status: 'ERR',
//           message: error,
//         });
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// }

module.exports = {
  // getAllMission,
  insertMission,
  updateMission,
};
