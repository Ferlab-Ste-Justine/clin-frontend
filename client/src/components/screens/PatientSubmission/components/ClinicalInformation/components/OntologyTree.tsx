import React, { useEffect, useState } from 'react';
import { Tree } from 'antd';
import Api from 'helpers/api';
import { hpoDisplayName } from '../index';

export type TreeNode = {
  title: string;
  key: string;
  hasChildren?: boolean;
  children?: TreeNode[];
  disabled?: boolean;
};

type HPO = {
  hpo_id: string;
  name: string;
  parents: string[];
  is_leaf: boolean;
  compact_ancestors: { hpo_id: string, name: string }[];
};

type Props = {
    checkedKeys: any;
        onCheck: any;
};

const ROOT_PHENOTYPE = 'Phenotypic abnormality (HP:0000118)';

const hpoToTreeNode = (hpo: HPO): TreeNode => ({
  title: hpoDisplayName(hpo.hpo_id, hpo.name),
  key: hpo.hpo_id,
  hasChildren: !hpo.is_leaf,
  children: [],
  disabled: false,
});

const fetchRootNodes = (root: string) => Api.searchHpoChildren(root).then((res) => {
  const response = res as any; // TODO fix type here
  if (response.payload) {
    const { data } = response.payload.data;
    const { hits } = data;

    return hits.map((h: { _source: HPO }) => hpoToTreeNode(h._source));
  }
  return [];
});

const OntologyTree = (props: Props) => {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);

  const {
    checkedKeys, onCheck,
  } = props;

  useEffect(() => {
    fetchRootNodes(ROOT_PHENOTYPE).then((nodes) => setTreeNodes(nodes));
  }, []);

  const onLoadHpoChildren = (treeNodeClicked: any) => new Promise<void>((resolve) => {
    const { title } = treeNodeClicked;

    Api.searchHpoChildren(title).then((response) => {
      const res = response as any; // TODO fix type here
      const node: TreeNode = treeNodeClicked.props.data;

      if (res.payload) {
        const { data } = res.payload.data;
        const { hits } = data;

        node.children = hits.map((h: { _source: HPO }) => hpoToTreeNode(h._source));
        setTreeNodes([...treeNodes]);
        resolve();
      }
    });
  });

  return (
    <Tree
      loadData={onLoadHpoChildren}
      checkStrictly
      checkable
      checkedKeys={checkedKeys}
      onCheck={onCheck}
      treeData={treeNodes}
    />
  );
};

export default OntologyTree;
