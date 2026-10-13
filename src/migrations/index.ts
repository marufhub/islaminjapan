import * as migration_20261013_111941_initial from './20261013_111941_initial';
import * as migration_20261013_120717_media_owner from './20261013_120717_media_owner';
import * as migration_20261013_124949_search_text_and_contact from './20261013_124949_search_text_and_contact';
import * as migration_20261013_125828_about_page from './20261013_125828_about_page';
import * as migration_20261013_132200_policy_drafts from './20261013_132200_policy_drafts';
import * as migration_20261013_135958_ai_usage from './20261013_135958_ai_usage';
import * as migration_20261013_142111_ai_usage_pending from './20261013_142111_ai_usage_pending';
import * as migration_20261013_143117_history_scope from './20261013_143117_history_scope';
import * as migration_20261013_143357_openai_usage from './20261013_143357_openai_usage';
import * as migration_20261013_143406_drop_fallback_flag from './20261013_143406_drop_fallback_flag';

export const migrations = [
  {
    up: migration_20261013_111941_initial.up,
    down: migration_20261013_111941_initial.down,
    name: '20261013_111941_initial',
  },
  {
    up: migration_20261013_120717_media_owner.up,
    down: migration_20261013_120717_media_owner.down,
    name: '20261013_120717_media_owner',
  },
  {
    up: migration_20261013_124949_search_text_and_contact.up,
    down: migration_20261013_124949_search_text_and_contact.down,
    name: '20261013_124949_search_text_and_contact',
  },
  {
    up: migration_20261013_125828_about_page.up,
    down: migration_20261013_125828_about_page.down,
    name: '20261013_125828_about_page',
  },
  {
    up: migration_20261013_132200_policy_drafts.up,
    down: migration_20261013_132200_policy_drafts.down,
    name: '20261013_132200_policy_drafts',
  },
  {
    up: migration_20261013_135958_ai_usage.up,
    down: migration_20261013_135958_ai_usage.down,
    name: '20261013_135958_ai_usage',
  },
  {
    up: migration_20261013_142111_ai_usage_pending.up,
    down: migration_20261013_142111_ai_usage_pending.down,
    name: '20261013_142111_ai_usage_pending',
  },
  {
    up: migration_20261013_143117_history_scope.up,
    down: migration_20261013_143117_history_scope.down,
    name: '20261013_143117_history_scope',
  },
  {
    up: migration_20261013_143357_openai_usage.up,
    down: migration_20261013_143357_openai_usage.down,
    name: '20261013_143357_openai_usage',
  },
  {
    up: migration_20261013_143406_drop_fallback_flag.up,
    down: migration_20261013_143406_drop_fallback_flag.down,
    name: '20261013_143406_drop_fallback_flag'
  },
];
