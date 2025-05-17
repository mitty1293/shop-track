import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ConfirmationDialogProps {
    open: boolean; // ダイアログの表示状態を制御
    onClose: () => void; // ダイアログを閉じる処理 (キャンセル時など)
    onConfirm: () => void; // 確認ボタンを押したときの処理
    title: string; // ダイアログのタイトル
    message: string | React.ReactNode; // 確認メッセージ (ReactNodeでJSXも許容)
    confirmText?: string; // 確認ボタンのテキスト (デフォルト: "Confirm")
    cancelText?: string;  // キャンセルボタンのテキスト (デフォルト: "Cancel")
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm", // デフォルト値を設定
    cancelText = "Cancel",   // デフォルト値を設定
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose} // ダイアログ外クリックやEscapeキーで閉じる
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
        >
            <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
            <DialogContent>
                {typeof message === 'string' ? (
                    <DialogContentText id="confirmation-dialog-description">
                        {message}
                    </DialogContentText>
                ) : (
                    message // message が ReactNode の場合はそのままレンダリング
                )}
            </DialogContent>
            <DialogActions>
                {/* キャンセルボタン */}
                <Button onClick={onClose} color="inherit">
                    {cancelText}
                </Button>
                {/* 確認ボタン */}
                <Button onClick={onConfirm} color="primary" autoFocus>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
