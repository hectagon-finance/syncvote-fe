const DISCOURSE_ACTION = {
  CREATE_TOPIC: 'create-topic', //Create topic
  CREATE_POST: 'create-post', //Create post into topic
  UPDATE_TOPIC: 'update-topic', //Update first post of topic
  MOVE_TOPIC: 'move-topic', //Move Topic
};

const SNAPSHOT_ACTION = {
  CREATE_PROPOSAL: 'create-proposal', //Create topic
  VOTE_PROPOSAL: 'vote-proposal', //Create post into topic
};

module.exports = { DISCOURSE_ACTION, SNAPSHOT_ACTION };
