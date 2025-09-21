from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from core.game import GameEngine
from core.models import Decision

PROMPT = "\nChoose [p]eace, [h]ostile, [t]rade or [q]uit: "

def main(seed: int = 0) -> None:
    engine = GameEngine(seed=seed)
    state = engine.start_run(seed=seed)
    run_id = state.run_id
    print(f"Run started: {run_id}")
    print(f"Seed: {state.seed}")
    print("Tip: press q to quit at any time.")

    while True:
        event, error = engine.next_turn(run_id)
        state = engine.get_state(run_id)
        if error:
            if error == "EVENT_PENDING" and state and state.events_log:
                event = state.events_log[-1]
            else:
                print(f"\nError: {error}")
                break

        if event is None:
            print("\nNo more events. Ending run.")
            final = engine.end_run(run_id, reason="turn_limit")
            print(f"Final score: {final['final_score']}")
            break

        assert state is not None
        print(
            f"\nTurn {state.turn} | Stability: {state.stability:.2f} ({state.stability_state.value}) | Score: {state.score}"
        )
        print(f"Event: {event.summary}")
        involved = ", ".join(state.nations[nid].name for nid in event.nations)
        print(f"Involved nations: {involved}")
        if event.tags:
            print(f"Tags: {', '.join(event.tags)}")
        print("Choices:")
        print("  p) Champion cooperation  h) Apply pressure  t) Broker trade  q) Quit")

        choice = input(PROMPT).strip().lower()
        if choice == "q":
            final = engine.end_run(run_id, reason="player_quit")
            print(f"\nYou quit. Final score: {final['final_score']}")
            break
        key_map = {"p": Decision.peace, "h": Decision.hostile, "t": Decision.trade}
        if choice not in key_map:
            print("Invalid input. Try again.")
            continue

        updated_state, error = engine.make_decision(run_id, event.id, key_map[choice])
        if error:
            print(f"Error: {error}")
            continue
        assert updated_state is not None
        resolution = updated_state.events_log[-1].resolution if updated_state.events_log else None
        if resolution:
            print("Outcome:")
            for log in resolution.logs:
                print(f"  - {log}")
        print(f"Stability: {updated_state.stability:.2f} | Score: {updated_state.score}")
        print(f"Peace streak: {updated_state.peace_streak} | Chaos streak: {updated_state.chaos_streak}")
        if updated_state.god_quips:
            print(f"Latest god quip: {updated_state.god_quips[-1]}")
        if updated_state.revealed_traits:
            reveals = {
                state.nations[nid].name: traits for nid, traits in updated_state.revealed_traits.items() if traits
            }
            if reveals:
                print("Revealed traits:")
                for nation_name, traits in reveals.items():
                    formatted = ", ".join(trait.replace("_", " ") for trait in traits)
                    print(f"  * {nation_name}: {formatted}")

        if updated_state.run_status in ("collapsed", "won", "turn_limit"):
            final = engine.end_run(run_id, reason=updated_state.run_status)
            print(f"\nRun ended. Reason: {updated_state.run_status}. Final score: {final['final_score']}")
            break

if __name__ == "__main__":
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    main(seed)
