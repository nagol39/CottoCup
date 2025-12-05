export default function GameFormatPage() {
  return (
    <main className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6">Game Format</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Two Man Scramble</h2>
        <p className="mb-3">A team format where both players tee off, the team selects the preferred shot, and both players play their next shots from that selected position. The process repeats until the ball is holed.</p>
        <ul className="list-disc list-inside text-gray-800">
          <li>Team of two players; one score per hole for the team.</li>
          <li>Both players tee off on every hole; choose the best drive.</li>
          <li>Both players then play from the chosen spot (usually within one club length, no nearer the hole).</li>
          <li>Continue selecting the best shot until the ball is holed.</li>
          <li>Handicap strokes are applied according to the event rules.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Modified Alternate Shot</h2>
        <p className="mb-3">A variation on traditional foursomes where both players tee off, the team selects the preferred tee shot, and players alternate shots from that point (the player who did not play the chosen tee shot plays the next shot).</p>
        <ul className="list-disc list-inside text-gray-800">
          <li>Both players tee off; pick the preferred tee shot for the team to play.</li>
          <li>The player who did not play the selected tee shot plays the next shot; alternate thereafter.</li>
          <li>Only one ball is in play for the team after the choice is made.</li>
          <li>Penalty strokes and local rules follow standard competition guidelines.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Tip it N' Rip it</h2>
        <p className="mb-3">A new and alternative version to alternate shot. One player will tee off from the Tips and the partner will tee off from the Reds. After that teams will choose which ball to play and begin alternating from this point on. The players will switch tee spots every hole.</p>
        <ul className="list-disc list-inside text-gray-800">
          <li>Both teammates tee off; One from the Tips the other from the Reds; choose the drive that gives the best scoring opportunity.</li>
          <li>Chosen drive becomes the ball in play for the team; Alternate shots are played from that position.</li>
          <li>Format rewards long, aggressive tee shots but teams must manage risk (penalties apply as usual).</li>
          <li>Scoring and handicap adjustments follow the event's published rules.</li>
        </ul>
      </section>

      <section className="mt-12 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Rules</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">General</h3>
          <ul className="list-disc list-inside text-gray-800">
            <li>All players must follow the host course's local rules and the Committee's instructions.</li>
            <li>Play in the spirit of the game: safety, pace of play, and respect for other groups are required.</li>
            <li>Tees, fairways, greens and hazards are played as marked in the event notice.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Scoring</h3>
          <ul className="list-disc list-inside text-gray-800">
            <li>Each team records one score per hole unless otherwise noted by the format.</li>
            <li>If a hole is cancelled for the entire field, it will be excluded from the total score.</li>
            <li>Scorecards must be signed and submitted to the Committee by the end of play; failure to do so may result in disqualification.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Handicaps</h3>
          <ul className="list-disc list-inside text-gray-800">
            <li>Handicap strokes are applied according to the event's published handicap allocation method.</li>
            <li>In team formats, the allocation of strokes between partners follows the Committee's published rules for that format.</li>
            <li>Players are responsible for ensuring their handicap is correct prior to starting play.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Penalties &ability</h3>
          <ul className="list-disc list-inside text-gray-800">
            <li>Standard Rules of Golf penalties apply (stroke, loss of hole, or disqualification as appropriate).</li>
            <li>Any rules questions should be referred to the Committee immediately; decisions of the Committee are final.</li>
            <li>Course damage (e.g., unattended carts causing harm) may result in penalty per Committee determination.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Etiquette & Pace of Play</h3>
          <ul className="list-disc list-inside text-gray-800">
            <li>Keep up with the group ahead; allow faster groups to play through when requested.</li>
            <li>Repair divots and ball marks and rake bunkers after use.</li>
            <li>Use ready golf when appropriate to help maintain pace of play.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}