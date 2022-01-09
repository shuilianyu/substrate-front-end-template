import React, { useEffect, useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

import KittyCards from './KittyCards';

const convertToKittyHash = entry =>
  `0x${entry[0].toJSON().slice(-64)}`;

const constructKitty = (hash, { dna, price, gender, owner }) => ({
  id: hash,
  dna,
  // price: price.toJSON(),
  // gender: gender.toJSON(),
  // owner: owner.toJSON()
});

export default function Kitties (props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [kittyHashes, setKittyHashes] = useState([]);
  const [kitties, setKitties] = useState([]);
  const [status, setStatus] = useState('');
  const [owners, setOwners] = useState([]);
  const [DNAs, setDNAs] = useState([]);

  const subscribeKittyCnt = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.substrateKitties.kittiesCount(async cnt => {
        // Fetch all kitty keys
        const entries = await api.query.substrateKitties.kitties.entries();
        const hashes = entries.map(convertToKittyHash);
        setKittyHashes(hashes);
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  



  const subscribeFetchDna = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.substrateKitties.kitties.multi(kittyHashes, kitties => {

        const DNAs = kitties.map((kitty, ) => kitty.value.dna);

        setDNAs(DNAs);
      });
    };


    asyncFetch();

    return () => {
      unsub && unsub();
    };
  }


  const subscribeFetchOwners = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.substrateKitties.owner.multi(kittyHashes, owners => {

        const _owners = owners.map((owner, ) => owner.toHuman());
        console.log("owners", _owners);
        setOwners(_owners);
      });
    };


    asyncFetch();

    return () => {
      unsub && unsub();
    };
  }





  const subscribeKitties = () => {
    if (kittyHashes.length > 0) {
      const kitties = kittyHashes.map((kittyHash, ind) => ({
        id: kittyHash,
        dna: DNAs[ind],
        owner: owners[ind]
      }));

      console.log("kitties", kitties);

      setKitties(kitties);
    }
  };

  
  useEffect(subscribeKittyCnt, [api, keyring]);
  useEffect(subscribeFetchOwners, [api, kittyHashes]);
  useEffect(subscribeFetchDna, [api, kittyHashes]);
  useEffect(subscribeKitties, [kittyHashes, DNAs, owners]);
  
  
  return <Grid.Column width={16}>
  <h1>Kitties</h1>
  <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
  <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='Create Kitty' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'substrateKitties',
            callable: 'createKitty',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>;
}
