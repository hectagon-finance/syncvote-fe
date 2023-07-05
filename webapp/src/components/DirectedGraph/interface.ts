export interface ICheckPoint {
  id?: string | undefined;
  data?: any | undefined;
  children?: string[];
  title?: string | undefined;
  description?: string | undefined;
  votingLocation?: string | undefined;
  position?: any;
  vote_machine_type?: string;
  isEnd?: boolean;
  duration?: number; // in seconds
  locked?: any;
  triggers?: any[];
  participation?: IParticipant;
}

// TODO: add version
// TODO: separate between data & cosmetic options

export interface IParticipant {
  type?: 'token' | 'identity';
  data?: IToken | string[];
}

export interface IToken {
  network?: string;
  address?: string;
  min?: number;
}
// TODO: do we need this interface or the ICheckPoint interface is sufficient?
export interface IVoteMachineConfigProps {
  editable: boolean;
  currentNodeId?: string;
  allNodes: any[];
  children: string[];
  data: any;
  onChange: (data: any) => void;
  /**
   * Solana Address
   * - If Provider is an excutable program then CPI to get the data
   * - If Provider is a Solana Address then it will be a signer of the txn
   * - If null voting power is always 1
   */
  votingPowerProvider?: string;
  /**
   * List of Solana Addresses
   * - If whitelist is empty then anyone can vote and votingPowerProvider decide the voting power
   * - If whitelist is not empty then only whitelisted addresses can vote
   *   and votingPowerProvider decide the voting power.
   */
  whitelist?: string[];
}

export interface IVoteMachineGetLabelProps {
  source: any;
  target: any;
}

export interface IVoteMachine {
  ConfigPanel: (props: IVoteMachineConfigProps) => JSX.Element;
  getName: () => string;
  getProgramAddress: () => string;
  getType: () => string;
  deleteChildNode: (data: any, children: string[], childId: string) => void;
  getLabel: (props: IVoteMachineGetLabelProps) => JSX.Element;
  getIcon: () => JSX.Element;
  getInitialData: () => any;
  explain: ({
    checkpoint,
    data,
  }: {
    checkpoint: ICheckPoint | undefined;
    data: any;
  }) => JSX.Element;
  validate: ({ checkpoint }: { checkpoint: ICheckPoint | undefined }) => {
    isValid: boolean;
    message: string[];
  };
}

export interface IWorkflowVersionLayoutMarker {
  title: string;
  color: string;
}

export interface IWorkflowVersionLayoutNode {
  position: {
    x: number;
    y: number;
  };
  style?: {
    header?: any;
    content?: any;
  };
}

export interface IWorkflowVersionLayoutEdge {
  style: {
    path: any;
    label: any;
    markerEnd: any;
  };
}

export interface IWorkflowVersionLayout {
  id: string;
  renderer: string;
  screen: 'horizontal' | 'vertical' | string;
  title: string;
  description?: string;
  nodes?: any[];
  edges?: any[];
  markers?: IWorkflowVersionLayoutMarker[];
  background?: {};
}

export interface IWorkflowVersionCosmetic {
  defaultLayout?: {
    horizontal: string;
    vertical: string;
  };
  layouts: IWorkflowVersionLayout[];
}

export interface IWorkflowVersion {
  start: string;
  checkpoints: ICheckPoint[];
  cosmetic?: IWorkflowVersionCosmetic;
}

export interface IGraph {
  data: IWorkflowVersion;
  selectedNodeId?: string;
  selectedLayoutId?: string;
  cosmetic?: IWorkflowVersionCosmetic;
  editable?: boolean;
  navPanel?: JSX.Element;
  onNodeClick?: (event: any, data: any) => void;
  onLayoutClick?: (data: any) => void;
  onPaneClick?: (event: any) => void;
  onNodeChanged?: (data: any) => void; // new name: onReactFlowNodeChanged
  onCosmeticChanged?: (changed: IWorkflowVersionCosmetic) => void;
  onResetPosition?: () => void;
  onAddNewNode?: () => void;
  onViewPortChange?: (viewport: any) => void;
  // web2Integrations?: any[];
  // onChange: (data: ICheckPoint) => void;
  // onDeleteNode: (ckpId: string) => void;
  // onConfigPanelClose: () => void;
  // onChangeLayout: (data: IWorkflowVersionLayout) => void;
}

export interface IConfigPanel {
  data: IWorkflowVersion;
  selectedNodeId?: string;
  selectedLayoutId?: string;
  web2Integrations?: any[];
  editable?: boolean;
  onChange: (data: ICheckPoint) => void;
  onDelete: (ckpId: string) => void;
  onClose: () => void;
  onChangeLayout: (data: IWorkflowVersionLayout) => void;
}
