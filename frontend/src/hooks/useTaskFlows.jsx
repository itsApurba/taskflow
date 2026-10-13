import { useState } from "react";
import { LuCoins, LuRotateCcw, LuSend, LuTrash2 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import Celebration from "../components/ui/Celebration";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import NoteDialog from "../components/ui/NoteDialog";
import { toaster } from "../components/ui/toaster";
import { errorMessage, useTaskAction } from "./useMarket";
import { firstName, formatNumber } from "../lib/game";

// The market's actions with their dialogs, toasts and the payout celebration,
// shared by the market lists and the task page. Render `dialogs` once.
//   claim(task)              worker takes an open task
//   submit(task)             worker sends their work for review (asks for a note)
//   approve(task, name)      manager pays the reward (asks to confirm, then celebrates)
//   reject(task, name)       manager sends it back (asks for a note)
//   remove(task)             manager deletes an open task (asks to confirm)
const useTaskFlows = ({ onDeleted } = {}) => {
  const navigate = useNavigate();
  const claimAction = useTaskAction("claim");
  const submitAction = useTaskAction("submit");
  const approveAction = useTaskAction("approve");
  const rejectAction = useTaskAction("reject");
  const deleteAction = useTaskAction("delete");

  // { kind: "submit" | "approve" | "reject" | "delete", task, name }
  const [dialog, setDialog] = useState(null);
  const [payout, setPayout] = useState(null);
  const closeDialog = () => setDialog(null);

  const fail = (title) => (error) => toaster.create({ title, description: errorMessage(error), type: "error" });

  const claim = (task) =>
    claimAction.mutate(
      { id: task._id },
      {
        onSuccess: () =>
          toaster.create({
            title: "Claimed! It's yours.",
            description: `Finish it and submit for review to earn ${formatNumber(task.reward)} credits.`,
            type: "success",
            action: { label: "Open", onClick: () => navigate(`/market/${task._id}`) },
          }),
        onError: fail("Couldn't claim this task"),
      },
    );

  const confirmSubmit = (note) => {
    const { task, name } = dialog;
    submitAction.mutate(
      { id: task._id, note },
      {
        onSuccess: () => {
          closeDialog();
          toaster.create({
            title: "Sent for review",
            description: `${name ? firstName(name) : "Your manager"} will take a look. Credits land when it's approved.`,
            type: "success",
          });
        },
        onError: fail("Couldn't submit the task"),
      },
    );
  };

  const confirmApprove = () => {
    const { task, name } = dialog;
    approveAction.mutate(
      { id: task._id },
      {
        onSuccess: () => {
          closeDialog();
          setPayout({ task, name });
        },
        onError: (error) => {
          closeDialog();
          fail("Couldn't approve the task")(error);
        },
      },
    );
  };

  const confirmReject = (note) => {
    const { task, name } = dialog;
    rejectAction.mutate(
      { id: task._id, note },
      {
        onSuccess: () => {
          closeDialog();
          toaster.create({ title: `Sent back to ${name ? firstName(name) : "the worker"}`, description: "They'll see your note on the task.", type: "info" });
        },
        onError: fail("Couldn't send the task back"),
      },
    );
  };

  const confirmDelete = () => {
    const { task } = dialog;
    deleteAction.mutate(
      { id: task._id },
      {
        onSuccess: () => {
          closeDialog();
          toaster.create({ title: "Task deleted", description: `"${task.title}" is off the market.`, type: "success" });
          onDeleted?.(task);
        },
        onError: (error) => {
          closeDialog();
          fail("Couldn't delete the task")(error);
        },
      },
    );
  };

  const who = dialog?.name ?? "the worker";
  const dialogs = (
    <>
      <NoteDialog
        open={dialog?.kind === "submit"}
        onClose={closeDialog}
        onConfirm={confirmSubmit}
        loading={submitAction.isPending}
        icon={LuSend}
        title='Submit for review'
        description={dialog?.task ? `Tell ${dialog.name ? firstName(dialog.name) : "your manager"} what you did on "${dialog.task.title}".` : undefined}
        label='What did you do?'
        placeholder='e.g. Fixed it and added a test. The demo is on staging.'
        confirmLabel='Submit for review'
      />
      <NoteDialog
        open={dialog?.kind === "reject"}
        onClose={closeDialog}
        onConfirm={confirmReject}
        loading={rejectAction.isPending}
        required
        palette='orange'
        icon={LuRotateCcw}
        title='Send it back'
        description={`${firstName(who)} keeps the task and sees your note. Nothing is paid yet.`}
        label='What needs to change?'
        placeholder='e.g. The date is still off by a day in IST. Please check the timezone.'
        confirmLabel='Send back'
      />
      <ConfirmDialog
        open={dialog?.kind === "approve"}
        onClose={closeDialog}
        onConfirm={confirmApprove}
        loading={approveAction.isPending}
        palette='green'
        icon={LuCoins}
        title={`Approve and pay ${formatNumber(dialog?.task?.reward)} credits?`}
        description={dialog?.task ? `${who} gets ${formatNumber(dialog.task.reward)} credits and as much XP for "${dialog.task.title}".` : ""}
        confirmLabel='Approve and pay'
      />
      <ConfirmDialog
        open={dialog?.kind === "delete"}
        onClose={closeDialog}
        onConfirm={confirmDelete}
        loading={deleteAction.isPending}
        icon={LuTrash2}
        title='Delete this task?'
        description={dialog?.task ? `"${dialog.task.title}" leaves the market for good. You can't undo this.` : ""}
        confirmLabel='Delete task'
      />
      <Celebration
        open={Boolean(payout)}
        onClose={() => setPayout(null)}
        amount={payout?.task.reward}
        title={payout?.name ? `${firstName(payout.name)} got paid` : "Paid out"}
        description={payout ? `"${payout.task.title}" is done. ${formatNumber(payout.task.reward)} XP goes with it.` : undefined}
        actionLabel='Back to work'
      />
    </>
  );

  return {
    claim,
    submit: (task, name) => setDialog({ kind: "submit", task, name }),
    approve: (task, name) => setDialog({ kind: "approve", task, name }),
    reject: (task, name) => setDialog({ kind: "reject", task, name }),
    remove: (task) => setDialog({ kind: "delete", task }),
    claimingId: claimAction.isPending ? claimAction.variables?.id : null,
    dialogs,
  };
};

export default useTaskFlows;
