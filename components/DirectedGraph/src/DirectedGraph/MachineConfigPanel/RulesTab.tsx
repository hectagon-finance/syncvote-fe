import {
  Space,
  Drawer,
  Tabs,
  Collapse,
  Input,
  Modal,
  Button,
  Select,
} from 'antd';
import { useContext, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { GraphViewMode, ICheckPoint, IVoteMachine } from '../interface';
import ChooseVoteMachine from './ChooseVoteMachine';
import VotingPartipation from './rules/VotingParticipant';
import VotingDuration from './rules/VotingDuration';
import { getVoteMachine } from '../voteMachine';
import { GraphPanelContext } from '../context';
import CollapsiblePanel from '../components/CollapsiblePanel';
import { TextEditor } from 'rich-text-editor';
import MarkerEditNode from '../MarkerEdit/MarkerEditNode';
import SideNote from '../components/SideNote';

const RulesTab = ({ vmConfigPanel }: { vmConfigPanel: JSX.Element }) => {
  const { data, selectedNodeId, onChange, viewMode } =
    useContext(GraphPanelContext);
  const allCheckPoints = data.checkpoints ? [...data.checkpoints] : [];
  data.subWorkflows?.map((sw: any) => {
    sw.checkpoints?.map((chk: any) => {
      allCheckPoints.push({ ...chk, subWorkflowId: sw.refId });
    });
  });
  const selectedNode = allCheckPoints.find(
    (chk: any) => chk.id === selectedNodeId
  );
  const subWorkflows =
    data.subWorkflows?.map((s: any) => {
      return { value: s.refId, label: s.refId };
    }) || [];
  subWorkflows.push({ value: '', label: 'Root workflow' });
  const [vmDrawerVisbibility, setvmDrawerVisbibility] = useState(false);
  const setVoteMachine = ({
    type,
    initialData,
  }: {
    type: string;
    initialData: any;
  }) => {
    if (type !== 'isEnd') {
      const newNode = structuredClone(selectedNode);
      if (newNode) {
        newNode.vote_machine_type = type;
        newNode.data = initialData;
        newNode.children = [];
        newNode.isEnd = false;
        onChange(newNode);
      }
    } else {
      onChange({
        isEnd: true,
      });
    }
    setvmDrawerVisbibility(false);
  };
  const machine: any = getVoteMachine(selectedNode?.vote_machine_type || '');
  const [votingLocation, setVotingLocation] = useState(
    selectedNode?.votingLocation || ''
  );
  const type = selectedNode?.vote_machine_type || '';
  const subWorkflowId = selectedNode?.subWorkflowId || '';
  return (
    <>
      <Drawer
        open={vmDrawerVisbibility}
        onClose={() => {
          setvmDrawerVisbibility(false);
        }}
        headerStyle={{ display: 'none' }}
      >
        <ChooseVoteMachine
          changeVoteMachineType={setVoteMachine}
          currentType={type}
        />
      </Drawer>
      <Space className='w-full pb-4' direction='vertical' size='large'>
        <CollapsiblePanel title='Purpose & description'>
          <Space direction='vertical' size='small' className='w-full'>
            {/* <Space direction="horizontal" className="justify-between w-full">
                <span>Information supporting the decision</span>
                <Button
                  icon={locked.description ? <LockFilled /> : <UnlockOutlined />}
                  onClick={() => {
                    const newLocked = { ...locked, description: !locked.description };
                    const newNode = structuredClone(selectedNode);
                    newNode.locked = newLocked;
                    onChange(newNode);
                  }}
                  disabled={!editable}
                />
              </Space> */}
            <TextEditor
              value={selectedNode?.description}
              setValue={(val: any) => {
                const newNode = structuredClone(selectedNode);
                if (newNode) {
                  newNode.description = val;
                  onChange(newNode);
                }
              }}
            />
            {viewMode === GraphViewMode.EDIT_WORKFLOW_VERSION &&
            ['forkNode', 'joinNode'].indexOf(
              selectedNode?.vote_machine_type || ''
            ) === -1 ? (
              <div className='flex justify-between items-center'>
                <div>Select workflow</div>
                <Select
                  options={subWorkflows}
                  value={subWorkflowId}
                  onChange={(val) => {
                    onChange({
                      ...selectedNode,
                      subWorkflowId: val,
                    });
                  }}
                />
              </div>
            ) : (
              <div>{!subWorkflowId ? 'In root workflow' : subWorkflowId}</div>
            )}
          </Space>
        </CollapsiblePanel>
        <>
          {!selectedNode?.isEnd &&
          type !== 'forkNode' &&
          type !== 'joinNode' ? (
            <CollapsiblePanel title='Participants'>
              <VotingPartipation />
              <SideNote
                value={selectedNode?.participationDescription}
                className='mt-4'
                setValue={(val: string) => {
                  const newNode = structuredClone(selectedNode);
                  if (newNode) {
                    newNode.participationDescription = val;
                    onChange(newNode);
                  }
                }}
              />
            </CollapsiblePanel>
          ) : null}
        </>
        <CollapsiblePanel title='Voting method'>
          <>
            {viewMode === GraphViewMode.EDIT_WORKFLOW_VERSION &&
            !selectedNode?.isEnd ? (
              <div
                className='w-full flex justify-between items-center text-lg p-2 cursor-pointer rounded-lg border-2 border-solid border-violet-500 hover:text-violet-500'
                onClick={() => {
                  setvmDrawerVisbibility(true);
                }}
              >
                <div className='flex items-center gap-4'>
                  {machine?.getIcon()}
                  {machine?.getName()}
                </div>
                <EditOutlined />
              </div>
            ) : (
              <></>
            )}
            {viewMode === GraphViewMode.EDIT_WORKFLOW_VERSION &&
            selectedNode?.isEnd ? (
              <ChooseVoteMachine
                changeVoteMachineType={setVoteMachine}
                currentType={undefined}
              />
            ) : (
              <></>
            )}
          </>
        </CollapsiblePanel>
        {!selectedNode?.isEnd && type !== 'forkNode' && type !== 'joinNode' ? (
          <>
            <CollapsiblePanel title='Fallback Option'>
              <Space
                direction='horizontal'
                size='middle'
                className='w-full justify-between'
              >
                <div>
                  Option to fallback when duration is passed or vote result
                  cannot be decided
                </div>
                <Select
                  options={(selectedNode?.children || []).map((id: any) => {
                    return {
                      value: id,
                      label: allCheckPoints.find((chk: any) => chk.id === id)
                        ?.title,
                    };
                  })}
                  value={
                    selectedNode?.children ? selectedNode?.children[0] : ''
                  }
                  onChange={(selectedValue: string) => {
                    let children = selectedNode?.children || [];
                    const idx = children.indexOf(selectedValue);
                    children = [
                      children[idx],
                      ...children.slice(0, idx),
                      ...children.slice(idx + 1),
                    ];
                    onChange({
                      children,
                    });
                  }}
                />
              </Space>
            </CollapsiblePanel>
          </>
        ) : null}
        {vmConfigPanel}
        {!selectedNode?.isEnd && type !== 'forkNode' && type !== 'joinNode' ? (
          <VotingDuration />
        ) : null}
        <CollapsiblePanel title='Other info'>
          <Space direction='vertical' size='middle' className='w-full'>
            {!selectedNode?.isEnd &&
            type !== 'forkNode' &&
            type !== 'joinNode' ? (
              <Space direction='vertical' size='small' className='w-full'>
                <div className='text-gray-400'>Voting location</div>
                <TextEditor
                  value={votingLocation}
                  setValue={(val: any) => {
                    setVotingLocation(val);
                  }}
                  onBlur={async () => {
                    if (votingLocation !== selectedNode?.votingLocation) {
                      const newNode = structuredClone(selectedNode);
                      if (newNode) {
                        newNode.votingLocation = votingLocation;
                        onChange(newNode);
                      }
                    }
                  }}
                />
              </Space>
            ) : null}

            <Space direction='vertical' size='small' className='w-full'>
              <div className='text-gray-400'>Checkpoint color & label</div>
              <MarkerEditNode />
            </Space>
            <Space direction='vertical' size='small' className='w-full'>
              <div className='text-gray-400'>Note</div>
              {/* <Space direction="horizontal" className="justify-between w-full">
                <span>Information supporting the decision</span>
                <Button
                  icon={locked.description ? <LockFilled /> : <UnlockOutlined />}
                  onClick={() => {
                    const newLocked = { ...locked, description: !locked.description };
                    const newNode = structuredClone(selectedNode);
                    newNode.locked = newLocked;
                    onChange(newNode);
                  }}
                  disabled={!editable}
                />
              </Space> */}
              <TextEditor
                value={selectedNode?.note}
                setValue={(val: any) => {
                  const newNode = structuredClone(selectedNode);
                  if (newNode) {
                    newNode.note = val;
                    onChange(newNode);
                  }
                }}
              />
            </Space>
          </Space>
        </CollapsiblePanel>
      </Space>
    </>
  );
};

export default RulesTab;
