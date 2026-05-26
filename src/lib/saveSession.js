import { supabase } from './supabase.js';
import { getAnonUserId } from './identity.js';

export async function saveSession({ username, club, results, transfers, formation, startingBudget, budgetRemaining }) {
  try {
    const { table, userFixtures } = results;
    const userRow = table.find(r => r.club === club);
    if (!userRow) return;

    const wins   = userFixtures.filter(f => f.userGoals > f.oppGoals).length;
    const draws  = userFixtures.filter(f => f.userGoals === f.oppGoals).length;
    const losses = userFixtures.filter(f => f.userGoals < f.oppGoals).length;
    const gf     = userFixtures.reduce((s, f) => s + f.userGoals, 0);
    const ga     = userFixtures.reduce((s, f) => s + f.oppGoals, 0);

    const zone = userRow.position === 1 ? 'Champions'
      : userRow.position <= 4  ? 'Champions League'
      : userRow.position <= 6  ? 'Europa League'
      : userRow.position >= 18 ? 'Relegated'
      : 'Mid-table';

    const { error } = await supabase.from('game_sessions').insert({
      username,
      club,
      final_position:   userRow.position,
      points:           userRow.pts,
      wins, draws, losses,
      goals_for:        gf,
      goals_against:    ga,
      goal_diff:        userRow.gd,
      formation,
      starting_budget:  startingBudget,
      budget_remaining: budgetRemaining,
      transfers_in:     transfers.bought?.length ?? 0,
      transfers_out:    transfers.sold?.length ?? 0,
      outcome_zone:     zone,
      anon_user_id:     getAnonUserId(),
    });

    if (error) console.warn('Session save failed:', error.message);
  } catch (err) {
    console.warn('Session save error:', err.message);
  }
}
