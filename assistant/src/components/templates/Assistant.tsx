import {
  SlAlert,
  SlButton,
  SlDialog,
  SlIconButton,
  SlTooltip,
} from '@shoelace-style/shoelace/dist/react';
import { useEthers } from '@usedapp/core';
import React, { useEffect, useRef, useState } from 'react';
import { storage_key } from '../../lib/hooks';
import { useDappletStore } from '../../lib/stores/dapplet';
import Contracts from '../organisms/Contracts';
import Installation from '../organisms/Installation';
import LiveDeploy from '../organisms/LiveDeploy';
import LiveRegister from '../organisms/LiveRegister';
import Registration from '../organisms/Registration';

export default function Assistant() {
  const store = useDappletStore();
  console.log('asdf store', store);

  const { account, chainId, library, activateBrowserWallet, deactivate } =
    useEthers();

  useEffect(() => {
    store.loading && store.load();
  }, []);

  useEffect(() => {
    !store.loading && localStorage.setItem(storage_key, JSON.stringify(store));
  }, [store]);

  // const { value: owner } = useOwnershipFacet.owner(store?.client, []) || {};
  // console.log(owner?.[0] === account ? '✅ IS OWNER' : '🚫 ERR: IS NOT OWNER');

  ////////////////////// for debugging
  useEffect(() => {
    const l = localStorage.getItem(storage_key);
    l && console.log('asdf localStorage', JSON.parse(l));
  }, [store]);
  //////////////////////

  const dialog = useRef(null);
  const [open, setOpen] = useState(true);

  function handleRequestClose(event: any) {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
      setOpen(false);
    }
  }

  function handleHide(e: any) {
    if (e.target === dialog.current) {
      setOpen(false);
    }
  }

  function handleReset() {
    store.reset().then(() => {
      store.load();
    });
  }

  return (
    <>
      {
        <SlDialog
          onSlRequestClose={handleRequestClose}
          open={/* chainId.toString() === config.chainId &&  */ open}
          onSlAfterHide={handleHide}
          ref={dialog}
        >
          <div
            slot="label"
            className="flex flex-row items-center justify-between"
          >
            <div>Dapplet Dev Assistant</div>
          </div>
          <div slot="header-actions" className="flex items-center">
            <SlTooltip content="Logout" placement="top">
              <SlIconButton name="box-arrow-right" onClick={deactivate} />
            </SlTooltip>
          </div>
          <div slot="header-actions" className="flex items-center">
            <SlTooltip content="Reset" placement="top">
              <SlIconButton name="arrow-clockwise" onClick={handleReset} />
            </SlTooltip>
          </div>
          <>
            {account ? (
              <>
                {store ? (
                  <div>
                    <Contracts />
                    <Registration />
                    <Installation />
                    <LiveDeploy />
                    <LiveRegister />
                  </div>
                ) : (
                  <SlAlert variant="warning" open>
                    dapplet.json not found
                  </SlAlert>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <SlButton
                  variant="primary"
                  onClick={() => activateBrowserWallet()}
                >
                  CONNECT
                </SlButton>
              </div>
            )}
          </>
        </SlDialog>
      }
      <SlTooltip content="Development Setup" placement="bottom">
        <SlIconButton
          name="gem"
          label="Edit"
          style={{ fontSize: '2.5rem', color: 'var(--sl-color-primary-500)' }}
          onClick={() => setOpen(true)}
        />
      </SlTooltip>
    </>
  );
}
