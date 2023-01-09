import { AbilityBuilder, Ability } from '@casl/ability';
import { render } from 'mustache';
import { AuthChecker } from 'type-graphql';
import knex from './data-source.js';
import { Rule } from './rule/entity';
import { User } from './user/entity';

type TContext = { application: string; user: User };

async function defineAbility(r: Rule[], context: TContext) {
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  r.forEach(r => {
    const rule = {
      ...r,
      conditions: JSON.parse(render(JSON.stringify(r.conditions), context)),
    };

    rule.inverted
      ? cannot(rule.action, rule.subject, rule.fields, rule.conditions)
      : can(rule.action, rule.subject, rule.fields, rule.conditions);
  });

  return new Ability(rules);
}

export const customAuthChecker: AuthChecker<TContext, Partial<Rule>> = async (
  { context },
  abilities
) => {
  if (!context.user) {
    return false;
  }

  if (!abilities || !abilities.length) return context.user ? true : false;

  const rules = await knex('user_rule')
    .where({
      user_uuid: context.user.uuid,
    })
    .leftJoin<Rule>('rule', {
      uuid: 'user_rule.rule_uuid',
    })
    .select<Rule[]>('rule.*');

  if (!rules) return false;

  const userAbilities = await defineAbility(rules, context);

  return abilities.every(rule =>
    userAbilities.can(rule.action, rule.subject, rule.fields)
  );
};
