import React from 'react';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';

import { generateConsequencesDataLines } from './consequences';
import HighBadgeIcon from 'components/icons/variantBadgeIcons/HighBadgeIcon';
import LowBadgeIcon from 'components/icons/variantBadgeIcons/LowBadgeIcon';
import ModerateBadgeIcon from 'components/icons/variantBadgeIcons/ModerateBadgeIcon';
import ModifierBadgeIcon from 'components/icons/variantBadgeIcons/ModifierBadgeIcon';
import { Consequence, Impact } from 'store/graphql/variants/models';
import { toKebabCase } from 'components/Utils/utils';

import style from './ConsequencesCell.module.scss';

type OwnProps = {
  consequences: Consequence[];
};

const impactToColorClassName = Object.freeze({
  [Impact.High]: <HighBadgeIcon svgClass={`${style.bullet} ${style.highImpact}`} />,
  [Impact.Low]: <LowBadgeIcon svgClass={`${style.bullet} ${style.lowImpact}`} />,
  [Impact.Moderate]: <ModerateBadgeIcon svgClass={`${style.bullet} ${style.moderateImpact}`} />,
  [Impact.Modifier]: <ModifierBadgeIcon svgClass={`${style.bullet} ${style.modifierImpact}`} />,
});

const pickImpacBadge = (impact: Impact) => impactToColorClassName[impact];

const ConsequencesCell = ({ consequences }: OwnProps) => {
  const lines = generateConsequencesDataLines(consequences);
  return (
    <>
      {lines.map((consequence: Consequence, index: number) => {
        /* Note: index can be used as key since the list is readonly */
        const node = consequence.node;

        if (node.consequences) {
          return (
            <StackLayout center key={index}>
              {pickImpacBadge(node.vep_impact)}
              <span key={index} className={style.detail}>
                {node.consequences[0]}
              </span>
              {node.symbol && (
                <span key={toKebabCase(node.symbol)} className={style.symbol}>
                  <a
                    className={style.symbolLink}
                    href={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${node.symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {node.symbol}
                  </a>
                </span>
              )}
              {node.aa_change && <span>{node.aa_change}</span>}
            </StackLayout>
          );
        }

        return null;
      })}
    </>
  );
};

export default ConsequencesCell;
