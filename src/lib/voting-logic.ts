import { VoteChoice } from '@prisma/client'

export type VoteResult = {
  yes: number
  no: number
  abstain: number
  totalVotes: number
  yesPercentage: number
  noPercentage: number
  abstainPercentage: number
  turnoutPercentage?: number
}

export function calculateWeightedResult(
  votes: { choice: VoteChoice; shares: number }[], 
  totalSharesPossible?: number
): VoteResult {
  let yes = 0
  let no = 0
  let abstain = 0

  votes.forEach(vote => {
    switch (vote.choice) {
      case 'YES':
        yes += vote.shares
        break
      case 'NO':
        no += vote.shares
        break
      case 'ABSTAIN':
        abstain += vote.shares
        break
    }
  })

  const totalVotes = yes + no + abstain
  
  const calculatePercentage = (value: number, total: number) => 
    total > 0 ? (value / total) * 100 : 0

  return {
    yes,
    no,
    abstain,
    totalVotes,
    yesPercentage: calculatePercentage(yes, totalVotes),
    noPercentage: calculatePercentage(no, totalVotes),
    abstainPercentage: calculatePercentage(abstain, totalVotes),
    turnoutPercentage: totalSharesPossible 
      ? calculatePercentage(totalVotes, totalSharesPossible) 
      : undefined
  }
}
