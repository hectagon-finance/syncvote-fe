import React from 'react';
import { PAGE_ROUTER } from '@constants/common';
import Success from '@assets/icons/Success';
import { Button } from 'antd';
import { useEffect } from 'react';
import { resetLastProposalId } from '../utils';

interface Props {
  setPage: any;
}

const DoneCreateProposal: React.FC<Props> = ({ setPage }) => {
  useEffect(() => {
    resetLastProposalId();
  });
  return (
    <div className='flex flex-col text-center mt-[22px]'>
      <div className='flex flex-col gap-3 justify-center items-center mb-[124px] mt-[80px]'>
        <div className='flex rounded-full h-[62px] w-[62px] bg-[#EAF6EE] justify-center items-center cursor-pointer'>
          <Success />
        </div>
        <p className='text-[13px]'>Create successful</p>
      </div>
      <Button
        className='w-full bg-[#000]'
        type='primary'
        size='large'
        onClick={() => {
          setPage(PAGE_ROUTER.VOTING);
        }}
      >
        Done
      </Button>
    </div>
  );
};

export default DoneCreateProposal;
