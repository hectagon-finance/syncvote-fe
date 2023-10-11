import { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Progress,
  Space,
  Tag,
  Timeline,
  Radio,
  Empty,
} from 'antd';
import {
  UploadOutlined,
  ReloadOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { Icon } from 'icon';
import { useParams } from 'react-router-dom';
import { queryAMissionDetail } from '@dal/data';
import { extractIdFromIdString } from 'utils';
import { Modal } from 'antd';
import { useDispatch } from 'react-redux';
import {
  formatDate,
  getTimeElapsedSinceStart,
  getTimeRemainingToEnd,
} from '@utils/helpers';
import ModalListParticipants from './fragments/ModalListParticipants';
import ModalVoterInfo from './fragments/ModalVoterInfo';
import { extractCurrentCheckpointId } from '@utils/helpers';
import parse from 'html-react-parser';
import VoteSection from './fragments/VoteSection';

const MissionVotingDetail = () => {
  const { missionIdString } = useParams();
  const missionId = extractIdFromIdString(missionIdString);
  const [missionData, setMissionData] = useState<any>();
  const [isReachedQuorum, setIsReachedQuorum] = useState<boolean>();
  const [openModalListParticipants, setOpenModalListParticipants] =
    useState<boolean>(false);
  const [openModalVoterInfo, setOpenModalVoterInfo] = useState<boolean>(false);
  const [listParticipants, setListParticipants] = useState<any[]>([]);
  const [selectedOption, onSelectedOption] = useState<number>(-1);
  const [currentCheckpointData, setCurrentCheckpointData] = useState<any>();
  const [submission, setSubmission] = useState<any>()

  const dispatch = useDispatch();

  const fetchData = () => {
    queryAMissionDetail({
      missionId,
      onSuccess: (data: any) => {
        setMissionData(data);
        console.log('data', data);
        const currentCheckpointId = extractCurrentCheckpointId(data.id);
        const checkpointData = data?.data?.checkpoints.filter(
          (checkpoint: any) => checkpoint.id === currentCheckpointId
        );
        console.log('checkpointData', checkpointData[0]);
        let checkpointDataAfterHandle = checkpointData[0];

        switch (checkpointData[0]?.vote_machine_type) {
          case 'SingleChoiceRaceToMax':
            if (checkpointData[0]?.includedAbstain === true) {
              checkpointDataAfterHandle.data.options.push('Abstain');
            }
            break;
          case 'UpVote':
            checkpointDataAfterHandle.data.options = [];
            checkpointDataAfterHandle.data.options.push('Upvote');
            if (checkpointData[0]?.includedAbstain === true) {
              checkpointDataAfterHandle.data.options.push('Abstain');
            }
            break;
          case 'Veto':
            checkpointDataAfterHandle.data.options = [];
            checkpointDataAfterHandle.data.options.push('Upvote');
            if (checkpointData[0]?.includedAbstain === true) {
              checkpointDataAfterHandle.data.options.push('Abstain');
            }
            break;
          default:
            break;
        }
        setCurrentCheckpointData(checkpointDataAfterHandle);
      },
      onError: (error) => {
        Modal.error({
          title: 'Error',
          content: error,
        });
      },
      dispatch,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('missionData', missionData);
  }, [missionData]);

  useEffect(() => {
    if (missionData && currentCheckpointData) {
      if (missionData.result) {
        const totalVotingPower = Object.values(missionData.result).reduce(
          (acc: number, voteData: any) => acc + voteData.voting_power,
          0
        );
        if (totalVotingPower >= currentCheckpointData.quorum) {
          setIsReachedQuorum(true);
        }
      }

      setListParticipants(currentCheckpointData.participation.data);
    }
  }, [missionData, selectedOption]);

  return (
    <>
      {missionData && currentCheckpointData && (
        <div className='w-[1033px] flex gap-4'>
          <div className='w-2/3'>
            <div className='flex flex-col mb-10 gap-6'>
              <div className='flex gap-4'>
                <Tag bordered={false} color='green' className='text-base'>
                  Active
                </Tag>
                <Button
                  style={{ border: 'None', padding: '0px', boxShadow: 'None' }}
                  className='text-[#6200EE]'
                  icon={<UploadOutlined />}
                >
                  Share
                </Button>
              </div>
              <div className='flex items-center'>
                <Icon presetIcon='' iconUrl='' size='large' />
                <div className='flex flex-col ml-2'>
                  <p className='font-semibold text-xl	'>{missionData.m_title}</p>
                  <p>Investment Process</p>
                </div>
              </div>
            </div>
            <Space direction='vertical' size={16} className='w-full'>
              <Card className='w-[271px]'>
                <Space direction='horizontal' size={'small'}>
                  <p>Author</p>
                  <Icon iconUrl='' presetIcon='' size='medium' />
                  <p className='w-[168px] truncate ...'>{missionData.author}</p>
                </Space>
              </Card>
              <Card className='p-4'>
                <div className='flex flex-col gap-6'>
                  <p className='text-xl font-medium'>Checkpoint description</p>
                  {currentCheckpointData?.description ? (
                    <p className='ml-4'>
                      {parse(currentCheckpointData?.description)}
                    </p>
                  ) : (
                    <div className='flex justify-center items-center w-full'>
                      <Empty />
                    </div>
                  )}
                  <Button
                    style={{
                      border: 'None',
                      padding: '0px',
                      boxShadow: 'None',
                    }}
                    className=''
                  >
                    {/* <p className='text-[#6200EE]'>View more</p> */}
                  </Button>
                </div>
              </Card>
              <VoteSection
                currentCheckpointData={currentCheckpointData}
                setOpenModalVoterInfo={setOpenModalVoterInfo}
                onSelectedOption={onSelectedOption}
                setSubmission={setSubmission}
                submission={submission}
              />
              <Card className='p-4'>
                <div className='flex flex-col gap-4'>
                  <p className='text-xl font-medium'>Votes</p>
                  <div className='flex'>
                    <p className='w-8/12'>Identity</p>
                    <p className='w-4/12 text-right'>Vote</p>
                  </div>
                  {missionData.vote_record &&
                    missionData.vote_record.map(
                      (record: any, recordIndex: number) => {
                        return (
                          <div className='flex mb-4' key={recordIndex}>
                            <div className='w-8/12 flex items-center gap-2'>
                              <Icon iconUrl='' presetIcon='' size='medium' />
                              <p>{record.identify}</p>
                            </div>
                            {record.option.map(
                              (option: any, optionIndex: number) => {
                                const voteOption =
                                  option === '-1'
                                    ? 'Abstain'
                                    : currentCheckpointData.data.options[
                                        parseInt(option)
                                      ];
                                console.log('voteOption', voteOption);
                                return (
                                  <p
                                    key={optionIndex}
                                    className='w-4/12 text-right'
                                  >
                                    {voteOption}
                                  </p>
                                );
                              }
                            )}
                          </div>
                        );
                      }
                    )}
                </div>
                {/* <div className='w-full flex justify-center items-center'>
                  <Button className='mt-4' icon={<ReloadOutlined />}>
                    View More
                  </Button>
                </div> */}
              </Card>
            </Space>
          </div>
          <div className='flex-1 flex flex-col gap-4'>
            <Card className=''>
              <p className='mb-6 text-base font-semibold'>Progress</p>
              <Timeline
                items={[
                  {
                    color: '#D9D9D9',
                    children: 'Temperature Check',
                  },
                  {
                    color: '#D9D9D9',
                    children: 'Proposal revision',
                  },
                  {
                    color: 'green',
                    children: 'Consensus Check',
                  },
                ]}
              />
              <div className='w-full flex justify-center items-center'>
                <Button className='w-full' icon={<BranchesOutlined />}>
                  View live workflow
                </Button>
              </div>
            </Card>
            {missionData.result ? (
              <Card className=''>
                <p className='mb-6 text-base font-semibold'>Voting results</p>
                {currentCheckpointData.data.options.map(
                  (option: any, index: any) => {
                    // still calculate voting_power of Abstain but not show in result
                    if (option === 'Abstain') {
                      return <div key={-1}></div>;
                    }
                    const totalVotingPower = Object.values(
                      missionData.result
                    ).reduce(
                      (acc: number, voteData: any) =>
                        acc + voteData.voting_power,
                      0
                    );

                    let percentage;
                    if (currentCheckpointData.quorum >= totalVotingPower) {
                      percentage =
                        (missionData.result[index].voting_power /
                          currentCheckpointData.quorum) *
                        100;
                    } else {
                      percentage =
                        (missionData.result[index].voting_power /
                          totalVotingPower) *
                        100;
                    }
                    percentage = parseFloat(percentage.toFixed(2));
                    return (
                      <div key={index} className='flex flex-col gap-2'>
                        <p className='text-base font-semibold'>{option}</p>
                        <p className='text-base'>
                          {missionData.result[option]} votes
                        </p>
                        <Progress percent={percentage} size='small' />
                      </div>
                    );
                  }
                )}
                {isReachedQuorum ? (
                  <div className='w-full flex justify-center items-center mt-2'>
                    <Button className='w-full bg-[#EAF6EE] text-[#29A259]'>
                      Reached required quorum
                    </Button>
                  </div>
                ) : (
                  <div className='w-full flex justify-center items-center mt-2'>
                    <Button className='w-full'>Not reached quorum</Button>
                  </div>
                )}
              </Card>
            ) : (
              <></>
            )}
            <Card className=''>
              <p className='mb-4 text-base font-semibold'>Rules & conditions</p>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between'>
                  <p className='text-base '>Start time</p>
                  <p className='text-base font-semibold'>
                    {getTimeElapsedSinceStart(missionData.startToVote)}
                  </p>
                </div>
                <p className='text-right'>
                  {formatDate(missionData.startToVote)}
                </p>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between'>
                  <p className='text-base '>Remaining duration</p>
                  <p className='text-base font-semibold'>
                    {getTimeRemainingToEnd(missionData.endedAt)}
                  </p>
                </div>
                <p className='text-right'>{formatDate(missionData.endedAt)}</p>
              </div>
              <hr className='w-full my-4' />
              <div className='flex justify-between'>
                <p className='text-base '>Who can vote</p>
                <p
                  className='text-base font-semibold text-[#6200EE] cursor-pointer'
                  onClick={() => setOpenModalListParticipants(true)}
                >
                  View details
                </p>
              </div>
              <hr className='w-full my-4' />
              {currentCheckpointData?.data?.threshold ? (
                <div>
                  <div className='flex justify-between'>
                    <p className='text-base '>Threshold counted by</p>
                    <p className='text-base font-semibold'>Total votes made</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-base '>Threshold</p>
                    <p className='text-base font-semibold'>
                      {currentCheckpointData?.data?.threshold}
                    </p>
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div className='flex justify-between'>
                <p className='text-base '>Quorum</p>
                <p className='text-base font-semibold'>
                  {currentCheckpointData.quorum} votes
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
      <ModalListParticipants
        open={openModalListParticipants}
        onClose={() => setOpenModalListParticipants(false)}
        listParticipants={listParticipants}
      />
      <ModalVoterInfo
        option={selectedOption === -1 ? [-1] : [selectedOption - 1]}
        open={openModalVoterInfo}
        onClose={() => setOpenModalVoterInfo(false)}
        missionId={missionId}
      />
    </>
  );
};

export default MissionVotingDetail;
