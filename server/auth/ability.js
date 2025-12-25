import { AbilityBuilder, Ability } from '@casl/ability';

export function defineAbility(user) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  // Example rules - customize based on your needs
  if (user.role === 'admin') {
    can('manage', 'all');
  } else if (user.role === 'user') {
    can('read', 'Post');
    can('create', 'Post', { authorId: user.id });
    can('update', 'Post', { authorId: user.id });
    can('delete', 'Post', { authorId: user.id });
  }

  return build();
}

