const VoteHandleService = require('../services/VoteHandleService');

const voting = async (req, res) => {
  try {
    const { identify, option, voting_power, mission_id } = req.body;
    if (!identify || !option || !voting_power || !mission_id) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The input is required',
      });
    }

    const respone = await VoteHandleService.handleVoting(req.body);
    return res.status(200).json(respone);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const submitDoc = async (req, res) => {
  try {
    const { identify, doc_id, content, mission_id } = req.body;
    if (!identify || !doc_id || !content || !mission_id) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The input is required',
      });
    }

    const respone = await VoteHandleService.handleVoting(req.body);
    return res.status(200).json(respone);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

module.exports = {
  voting,
  submitDoc,
};
