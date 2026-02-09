import { SPECIAL_CARDS, GAME_CONSTANTS } from '../../../shared/constants.js';

/**
 * ScoreCalculator - Berechnet Punkte und Scores
 */
export class ScoreCalculator {
  /**
   * Berechnet Runden-Punkte für ein Team
   */
  static calculateRoundScore(team) {
    let score = 0;

    // Punkte aus Tricks
    team.players.forEach(player => {
      score += player.points;
    });

    // Tichu-Boni
    team.players.forEach(player => {
      if (player.tichuCalled && player.isOut) {
        score += 100; // Tichu gewonnen
      } else if (player.tichuCalled && !player.isOut) {
        score -= 100; // Tichu verloren
      }

      if (player.grandTichuCalled && player.isOut) {
        score += 200; // Grand Tichu gewonnen
      } else if (player.grandTichuCalled && !player.isOut) {
        score -= 200; // Grand Tichu verloren
      }
    });

    return score;
  }

  /**
   * Berechnet Punkte aus einem Trick
   */
  static calculateTrickPoints(trick) {
    let points = 0;

    if (!trick || !trick.plays) {
      return 0;
    }

    trick.plays.forEach(play => {
      if (play.cards && play.cards.length > 0) {
        play.cards.forEach(card => {
          points += card.getPointValue();
        });
      }
    });

    return points;
  }

  /**
   * Berechnet Final Score nach Runde
   */
  static calculateFinalScores(team1, team2) {
    const team1Score = this.calculateRoundScore(team1);
    const team2Score = this.calculateRoundScore(team2);

    // Double Win: Ein Team hat alle Tricks gewonnen
    const doubleWin = this.checkDoubleWin(team1, team2);

    let finalTeam1Score = team1Score;
    let finalTeam2Score = team2Score;

    if (doubleWin.team === 1) {
      finalTeam1Score = team2Score < 0 ? team1Score * 2 : team1Score + Math.abs(team2Score);
      finalTeam2Score = -finalTeam1Score;
    } else if (doubleWin.team === 2) {
      finalTeam2Score = team1Score < 0 ? team2Score * 2 : team2Score + Math.abs(team1Score);
      finalTeam1Score = -finalTeam2Score;
    }

    return {
      team1: finalTeam1Score,
      team2: finalTeam2Score,
      doubleWin: doubleWin.team !== null
    };
  }

  /**
   * Prüft ob ein Team Double Win hat (alle Tricks gewonnen)
   */
  static checkDoubleWin(team1, team2) {
    // Double Win: Ein Team hat alle 4 Spieler rausbekommen
    const team1AllOut = team1.players.every(p => p.isOut);
    const team2AllOut = team2.players.every(p => p.isOut);

    if (team1AllOut && !team2AllOut) {
      return { team: 1, message: 'Team 1 hat Double Win!' };
    }

    if (team2AllOut && !team1AllOut) {
      return { team: 2, message: 'Team 2 hat Double Win!' };
    }

    return { team: null };
  }

  /**
   * Aktualisiert Team-Scores
   */
  static updateTeamScores(team1, team2) {
    const scores = this.calculateFinalScores(team1, team2);

    team1.score += scores.team1;
    team2.score += scores.team2;

    return {
      team1Score: team1.score,
      team2Score: team2.score,
      roundScores: {
        team1: scores.team1,
        team2: scores.team2
      },
      doubleWin: scores.doubleWin
    };
  }

  /**
   * Prüft ob ein Team gewonnen hat (>= 1000 Punkte)
   */
  static checkGameOver(team1, team2) {
    if (team1.score >= GAME_CONSTANTS.WINNING_SCORE) {
      return { gameOver: true, winner: 1, score: team1.score };
    }

    if (team2.score >= GAME_CONSTANTS.WINNING_SCORE) {
      return { gameOver: true, winner: 2, score: team2.score };
    }

    return { gameOver: false };
  }

  /**
   * Berechnet ELO-Änderung nach Spiel
   */
  static calculateEloChange(winnerElo, loserElo, isWin) {
    const K = 32; // K-Faktor
    const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const actualScore = isWin ? 1 : 0;
    const eloChange = Math.round(K * (actualScore - expectedScore));
    return eloChange;
  }
}

